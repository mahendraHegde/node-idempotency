import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Logger,
  HttpException,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnprocessableEntityException,
  BadRequestException,
  ConflictException,
  Inject
} from '@nestjs/common'
import { StorageAdapter } from '@node-idempotency/storage'
import { Idempotency, Options } from '@node-idempotency/core'

import { type Observable, of, throwError } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { IDEMPOTENCY_OPTIONS, IDEMPOTENCY_STORAGE } from '../constants'

@Injectable()
export class NodeIdempotencyInterceptor implements NestInterceptor {
  nodeIdempotency: Idempotency
  constructor (
    protected readonly reflector: Reflector,
    @Inject(IDEMPOTENCY_STORAGE)
    private readonly stoarge: StorageAdapter,
    @Inject(IDEMPOTENCY_OPTIONS)
    optons?: Options
  ) {
    this.nodeIdempotency = new Idempotency(this.stoarge, optons)
  }

  async intercept (
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<any>()
    const options =
      this.reflector.get(IDEMPOTENCY_OPTIONS, context.getHandler()) ??
      this.reflector.get(IDEMPOTENCY_OPTIONS, context.getClass())
    try {
      const idempotent = await this.nodeIdempotency.onRequest({
        headers: request.headers,
        body: request.body,
        path: request.url,
        method: request.method,
        options
      })
      console.log(idempotent, null, 2)
      return next.handle()
    } catch (err) {
      if (err instanceof HttpException) {
        return throwError(() => err)
      }
    }

    // something unexpected happened, both cached response and handler did not execute as expected
    return throwError(() => new ServiceUnavailableException())
  }

  private buildError (error: any): HttpException {
    const statusCode = error.status || error.response?.statusCode || 500
    if (statusCode == 500 && !error.response) {
      // some unhandled exception occurred
      return new InternalServerErrorException()
    }

    return new HttpException(
      error.response || error.message,
      statusCode,
      error.response?.options
    )
  }

  private setHeaders (response: any, headers: Record<string, string>) {
    Object.keys(headers).map((key) => {
      if (headers[key]) {
        response.set(key, headers[key])
      }
    })
  }

  // private async handlerDuplicateRequest(context: ExecutionContext, bodyHash: string): Promise<Observable<any>> {
  //   const cacheKey = this.getCacheKey(context);
  //   const idempotencyKey = this.getIdempotencyKey(context)!;
  //   const data = await this.cacheService.get(cacheKey);
  //   this.setHeaders(context.switchToHttp().getResponse(), {
  //     [HttpResponseHeaderKeysEnum.IDEMPOTENCY_KEY]: idempotencyKey,
  //   });
  //   const parsed = JSON.parse(data);
  //   if (parsed.status === ReqStatusEnum.PROGRESS) {
  //     // api call is in progress, so client need to handle this case
  //     Logger.verbose(`previous api call in progress rejecting the request. key: "${idempotencyKey}"`, LOG_CONTEXT);
  //     this.setHeaders(context.switchToHttp().getResponse(), {
  //       [HttpResponseHeaderKeysEnum.RETRY_AFTER]: `1`,
  //       [HttpResponseHeaderKeysEnum.LINK]: DOCS_LINK,
  //     });

  //     throw new ConflictException(
  //       `Request with key "${idempotencyKey}" is currently being processed. Please retry after 1 second`
  //     );
  //   }
  //   if (bodyHash !== parsed.bodyHash) {
  //     //different body sent than before
  //     Logger.verbose(`idempotency key is being reused for different bodies. key: "${idempotencyKey}"`, LOG_CONTEXT);
  //     this.setHeaders(context.switchToHttp().getResponse(), {
  //       [HttpResponseHeaderKeysEnum.LINK]: DOCS_LINK,
  //     });

  //     throw new UnprocessableEntityException(
  //       `Request with key "${idempotencyKey}" is being reused for a different body`
  //     );
  //   }
  //   this.setHeaders(context.switchToHttp().getResponse(), { [HttpResponseHeaderKeysEnum.IDEMPOTENCY_REPLAY]: 'true' });

  //   //already seen the request return cached response
  //   if (parsed.status === ReqStatusEnum.ERROR) {
  //     Logger.verbose(`returning cached error response. key: "${idempotencyKey}"`, LOG_CONTEXT);

  //     throw this.buildError(parsed.data);
  //   }

  //   return of(parsed.data);
  // }

  // private async handleNewRequest(
  //   context: ExecutionContext,
  //   next: CallHandler,
  //   bodyHash: string
  // ): Promise<Observable<any>> {
  //   const cacheKey = this.getCacheKey(context);
  //   const idempotencyKey = this.getIdempotencyKey(context)!;

  //   return next.handle().pipe(
  //     map(async (response) => {
  //       const httpResponse = context.switchToHttp().getResponse();
  //       const statusCode = httpResponse.statusCode;

  //       // Cache the success response and return it
  //       await this.setCache(
  //         cacheKey,
  //         { status: ReqStatusEnum.SUCCESS, bodyHash, statusCode: statusCode, data: response },
  //         IDEMPOTENCY_CACHE_TTL
  //       );
  //       Logger.verbose(`cached the success response for idempotency key: "${idempotencyKey}"`, LOG_CONTEXT);
  //       this.setHeaders(httpResponse, { [HttpResponseHeaderKeysEnum.IDEMPOTENCY_KEY]: idempotencyKey });

  //       return response;
  //     }),
  //     catchError((err) => {
  //       const httpException = this.buildError(err);
  //       // Cache the error response and return it
  //       const error = err instanceof HttpException ? err : httpException;
  //       this.setCache(
  //         cacheKey,
  //         {
  //           status: ReqStatusEnum.ERROR,
  //           statusCode: httpException.getStatus(),
  //           bodyHash,
  //           data: error,
  //         },
  //         IDEMPOTENCY_CACHE_TTL
  //       ).catch(() => {});
  //       Logger.verbose(`cached the error response for idempotency key: "${idempotencyKey}"`, LOG_CONTEXT);
  //       this.setHeaders(context.switchToHttp().getResponse(), {
  //         [HttpResponseHeaderKeysEnum.IDEMPOTENCY_KEY]: idempotencyKey,
  //       });

  //       throw err;
  //     })
  //   );
  // }
}
