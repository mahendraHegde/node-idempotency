import { StorageAdapter } from "@idempotent-http/storage";
import {
  HttpResponseHeaderKeysEnum,
  IdempotencyParams,
  IdempotencyResponse,
  Options,
  RequestStatusEnum,
  StoragePayload,
} from "./types";
import {
  IDEMPOTENCY_CACHE_KEY_PREFIX,
  IDEMPOTENCY_CACHE_TTL_MS,
  IDEMPOTENCY_KEY_LEN,
} from "./constants";
import { IdempotentHTTPError, errorCodes } from "./error";
import { createHash } from "crypto";
export class IdempotentHTTP {
  options: Required<Options>;
  constructor(
    private storage: StorageAdapter,
    options?: Options,
  ) {
    this.options = {
      allowedMethods: [],
      excludeMethods: [],
      cacheKeyPrefix: IDEMPOTENCY_CACHE_KEY_PREFIX,
      headerKey: HttpResponseHeaderKeysEnum.IDEMPOTENCY_KEY.toLocaleLowerCase(),
      keyMaxLength: IDEMPOTENCY_KEY_LEN,
      cacheTTLMS: IDEMPOTENCY_CACHE_TTL_MS,
      enforceIdempotency: false,
      ...options,
    };
  }

  private buildRequestOptions(options?: Options): Required<Options> {
    const enforceIdempotency =
      options?.enforceIdempotency !== undefined
        ? options?.enforceIdempotency
        : this.options.enforceIdempotency;
    return { ...this.options, ...options, enforceIdempotency };
  }

  private isEnabled(req: IdempotencyParams): boolean {
    if (
      this.options.allowedMethods?.length &&
      !this.options.allowedMethods.includes(req.method)
    ) {
      return false;
    }
    if (this.options.excludeMethods?.includes(req.method)) {
      return false;
    }
    const idempotencyKey = req.headers[this.options.headerKey];
    if (!idempotencyKey) {
      if (req.options?.enforceIdempotency) {
        throw new IdempotentHTTPError(
          `Idempotency-Key is missing`,
          errorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
          {
            statusCode: 400,
          },
        );
      }
      return false;
    }
    return true;
  }

  private validateRequest(req: IdempotencyParams) {
    const idempotencyKey = req.headers[this.options.headerKey] as string;
    if (idempotencyKey.length > this.options.keyMaxLength) {
      throw new IdempotentHTTPError(
        `Idempotency-Key length exceeds max allowed length`,
        errorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
        {
          statusCode: 400,
        },
      );
    }
  }

  private getIdempotencyKey(req: IdempotencyParams): string {
    const idempotencyKey = req.headers[this.options.headerKey] as string;
    const { path, method } = req;
    return `${this.options.cacheKeyPrefix}:${method}:${path}:${idempotencyKey}`;
  }

  private hash(body: Record<string, unknown>): string {
    const hash = createHash("blake2s256");
    hash.update(Buffer.from(JSON.stringify(body)));

    return hash.digest("hex");
  }

  async onRequest<BodyType, ErrorType>(
    req: IdempotencyParams,
  ): Promise<IdempotencyResponse<BodyType, ErrorType> | void> {
    req.options = this.buildRequestOptions(req.options);
    if (this.isEnabled(req)) {
      const fingerPrint = req.body ? this.hash(req.body) : undefined;
      const payload: StoragePayload = {
        status: RequestStatusEnum.IN_PROGRESS,
        fingerPrint,
      };
      const cacheKey = this.getIdempotencyKey(req);
      this.validateRequest(req);
      const isNew = await this.storage.setIfNotExists(
        cacheKey,
        JSON.stringify(payload),
        { ttl: this.options.cacheTTLMS },
      );
      if (!isNew) {
        const data = JSON.parse(
          await this.storage.get(cacheKey),
        ) as StoragePayload<BodyType, ErrorType>;
        if (data.status === RequestStatusEnum.IN_PROGRESS) {
          throw new IdempotentHTTPError(
            `A request is outstanding for this Idempotency-Key`,
            errorCodes.REQUEST_IN_PROGRESS,
            {
              statusCode: 409,
              headers: {
                [HttpResponseHeaderKeysEnum.RETRY_AFTER]: "1",
              },
            },
          );
        } else {
          if (fingerPrint !== data.fingerPrint) {
            throw new IdempotentHTTPError(
              `Idempotency-Key is already used`,
              errorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH,
              {
                statusCode: 422,
              },
            );
          }
          return data.response;
        }
      }
    }
    return;
  }
}
