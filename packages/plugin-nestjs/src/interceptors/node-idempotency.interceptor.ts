import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  HttpException,
  InternalServerErrorException,
  Inject,
  HttpStatus,
} from "@nestjs/common";
import { StorageAdapter } from "@node-idempotency/storage";
import {
  Idempotency,
  IdempotencyError,
  type IdempotencyParams,
  type IdempotencyResponse,
  IdempotencyOptions,
  IdempotencyErrorCodes,
} from "@node-idempotency/core";
import {
  idempotency2HttpCodeMap,
  headers2Cache,
  HTTPHeaderEnum,
} from "@node-idempotency/shared";

import { type FastifyReply, type FastifyRequest } from "fastify";
import { type Response, type Request } from "express";

import { type Observable, of, throwError, map, catchError } from "rxjs";
import { Reflector } from "@nestjs/core";
import { IDEMPOTENCY_OPTIONS, IDEMPOTENCY_STORAGE } from "../constants";
import { Stream } from "stream";
import { type SerializedAPIException } from "../types";

@Injectable()
export class NodeIdempotencyInterceptor implements NestInterceptor {
  nodeIdempotency: Idempotency;
  constructor(
    private readonly reflector: Reflector,
    @Inject(IDEMPOTENCY_STORAGE)
    private readonly stoarge: StorageAdapter,
    @Inject(IDEMPOTENCY_OPTIONS)
    optons?: IdempotencyOptions,
  ) {
    this.nodeIdempotency = new Idempotency(this.stoarge, optons);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest | Request>();
    const response = context
      .switchToHttp()
      .getResponse<FastifyReply | Response>();

    const options =
      this.reflector.get(IDEMPOTENCY_OPTIONS, context.getHandler()) ??
      this.reflector.get(IDEMPOTENCY_OPTIONS, context.getClass());
    const idempotencyReq: IdempotencyParams = {
      headers: request.headers,
      body: request.body,
      path: request.url,
      method: request.method,
      options,
    };

    try {
      const idempotencyResponse: IdempotencyResponse | undefined =
        await this.nodeIdempotency.onRequest<unknown, SerializedAPIException>(
          idempotencyReq,
        );
      if (!idempotencyResponse) {
        return await this.handleNewRequest(idempotencyReq, context, next);
      }
      // this is a duplicate request
      if (idempotencyResponse.additional?.statusCode) {
        const { statusCode } = idempotencyResponse.additional;
        if ("code" in response && typeof response.code === "function") {
          // fastify
          void response.code(statusCode as number);
        } else {
          // express
          void response.status(statusCode as number);
        }
      }
      const headers = Object.values(headers2Cache).reduce<
        Record<string, string>
      >((res, cur) => {
        if (idempotencyResponse?.additional?.[cur]) {
          res[cur] = idempotencyResponse.additional[cur] as string;
        }
        return res;
      }, {});
      this.setHeaders(response, {
        ...headers,
        [HTTPHeaderEnum.idempotentReplayed]: "true",
      });
      if (typeof idempotencyResponse.body !== "undefined") {
        return of(idempotencyResponse.body);
      }
      throw this.buildError(
        idempotencyResponse.error as SerializedAPIException,
      );
    } catch (err) {
      if (err instanceof IdempotencyError) {
        const status =
          idempotency2HttpCodeMap[err.code] || HttpStatus.INTERNAL_SERVER_ERROR;
        if (err.code === IdempotencyErrorCodes.REQUEST_IN_PROGRESS) {
          this.setHeaders(response, { [HTTPHeaderEnum.retryAfter]: "1" });
        }
        return throwError(
          () => new HttpException(err.message, status as HttpStatus),
        );
      }
      if (err instanceof HttpException) {
        return throwError(() => err);
      }
    }

    // something unexpected happened, both cached response and handler did not execute as expected
    return throwError(() => new InternalServerErrorException());
  }

  private buildError(error: SerializedAPIException): HttpException {
    const statusCode = error.status ?? error.response?.statusCode ?? 500;
    if (statusCode === 500 && !error.response) {
      // some unhandled exception occurred
      return new InternalServerErrorException();
    }

    return new HttpException(
      error.response ?? error.message,
      statusCode,
      error.options,
    );
  }

  private setHeaders(
    response: FastifyReply | Response,
    headers: Record<string, string>,
  ): void {
    Object.keys(headers).forEach((key) => {
      if (headers[key]) {
        if ("set" in response && typeof response.set === "function") {
          // express
          void response.set(key, headers[key]);
        } else {
          // fastify
          void response.header(key, headers[key]);
        }
      }
    });
  }

  private async handleNewRequest(
    idempotencyReq: IdempotencyParams,
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    return next.handle().pipe(
      map(async (response) => {
        if (response instanceof Stream) {
          return response;
        }
        const httpResponse = context
          .switchToHttp()
          .getResponse<FastifyReply | Response>();
        const statusCode = httpResponse.statusCode;
        const additional = { statusCode };
        Object.values(headers2Cache).forEach((header) => {
          const head = httpResponse.getHeader(header);
          if (head) {
            additional[header] = head;
          }
        });
        const res: IdempotencyResponse = {
          additional,
          body: response,
        };
        await this.nodeIdempotency.onResponse(idempotencyReq, res);
        return response;
      }),
      catchError((err) => {
        const httpException = this.buildError(err as SerializedAPIException);
        const error = err instanceof HttpException ? err : httpException;
        const res: IdempotencyResponse = {
          additional: { statusCode: httpException.getStatus() },
          error,
        };
        this.nodeIdempotency.onResponse(idempotencyReq, res).catch(() => {});
        throw err;
      }),
    );
  }
}
