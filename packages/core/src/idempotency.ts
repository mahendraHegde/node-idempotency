import { type StorageAdapter } from "@node-idempotency/storage";
import {
  HttpHeaderKeysEnum,
  type IdempotencyParams,
  type IdempotencyParamsWithDefaults,
  type IdempotencyResponse,
  type IdempotencyOptions,
  RequestStatusEnum,
  type StoragePayload,
} from "./types";
import {
  IDEMPOTENCY_CACHE_KEY_PREFIX,
  IDEMPOTENCY_CACHE_TTL_MS,
  IDEMPOTENCY_KEY_LEN,
} from "./constants";
import { IdempotencyError, IdempotencyErrorCodes } from "./error";
import { createHash } from "crypto";
export class Idempotency {
  options: IdempotencyParamsWithDefaults["options"];
  constructor(
    private readonly storage: StorageAdapter,
    options?: IdempotencyOptions,
  ) {
    this.options = {
      cacheKeyPrefix: IDEMPOTENCY_CACHE_KEY_PREFIX,
      idempotencyKey: HttpHeaderKeysEnum.IDEMPOTENCY_KEY.toLocaleLowerCase(),
      keyMaxLength: IDEMPOTENCY_KEY_LEN,
      cacheTTLMS: IDEMPOTENCY_CACHE_TTL_MS,
      enforceIdempotency: false,
      ...options,
    };
  }

  private buildRequestOptions(
    options?: IdempotencyOptions,
  ): IdempotencyParamsWithDefaults["options"] {
    const enforceIdempotency =
      options?.enforceIdempotency !== undefined
        ? options?.enforceIdempotency
        : this.options.enforceIdempotency;
    return { ...this.options, ...options, enforceIdempotency };
  }

  private getInternalRequest(
    req: IdempotencyParams,
  ): IdempotencyParamsWithDefaults {
    return {
      ...req,
      options: this.buildRequestOptions(req.options),
    };
  }

  private getIdempotencyKey(
    req: IdempotencyParamsWithDefaults,
  ): string | undefined {
    const key = Object.keys(req.headers).find(
      (key) => key.toLowerCase() === req.options.idempotencyKey.toLowerCase(),
    );
    return key ? (req.headers[key] as string) : undefined;
  }

  private async isEnabled(
    req: IdempotencyParamsWithDefaults,
  ): Promise<boolean> {
    const idempotencyKey = this.getIdempotencyKey(req);
    if (!idempotencyKey) {
      if (req.options?.enforceIdempotency) {
        throw new IdempotencyError(
          "Idempotency-Key is missing",
          IdempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
        );
      }
      return false;
    }
    if (typeof req.options.skipRequest === "function") {
      const shouldSkip = await req.options.skipRequest(req);
      return !shouldSkip;
    }
    return true;
  }

  private validateRequest(req: IdempotencyParamsWithDefaults): void {
    const idempotencyKey = this.getIdempotencyKey(req);
    if (idempotencyKey && idempotencyKey.length > req.options.keyMaxLength) {
      throw new IdempotencyError(
        "Idempotency-Key length exceeds max allowed length",
        IdempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
      );
    }
  }

  private getIdempotencyCacheKey(req: IdempotencyParamsWithDefaults): string {
    const idempotencyKey = this.getIdempotencyKey(req);
    const { path, method } = req;
    return `${req.options.cacheKeyPrefix}:${method}:${path}:${idempotencyKey}`;
  }

  private hash(body: Record<string, unknown>): string {
    const hash = createHash("blake2s256");
    hash.update(Buffer.from(JSON.stringify(body)));

    return hash.digest("hex");
  }

  private getFingerPrint(
    req: IdempotencyParamsWithDefaults,
  ): string | undefined {
    return req.body ? this.hash(req.body) : undefined;
  }

  /**
   * @throws {@link IdempotencyError} if `request is already in progress or invalid`
   *
   * to be called on receiving the request, if the key is already cached, returns or throws based on the status, if returns nothing
   */
  async onRequest<BodyType, ErrorType>(
    req: IdempotencyParams,
  ): Promise<IdempotencyResponse<BodyType, ErrorType> | undefined> {
    const reqInternal: IdempotencyParamsWithDefaults =
      this.getInternalRequest(req);
    if (await this.isEnabled(reqInternal)) {
      const fingerPrint = this.getFingerPrint(reqInternal);
      const payload: StoragePayload = {
        status: RequestStatusEnum.IN_PROGRESS,
        fingerPrint,
      };
      const cacheKey = this.getIdempotencyCacheKey(reqInternal);
      this.validateRequest(reqInternal);
      const isNew = await this.storage.setIfNotExists(
        cacheKey,
        JSON.stringify(payload),
        { ttl: reqInternal.options.cacheTTLMS },
      );
      if (!isNew) {
        const cached = await this.storage.get(cacheKey);
        if (!cached) {
          return undefined;
        }
        const data = JSON.parse(cached) as StoragePayload<BodyType, ErrorType>;
        if (data.status === RequestStatusEnum.IN_PROGRESS) {
          throw new IdempotencyError(
            "A request is outstanding for this Idempotency-Key",
            IdempotencyErrorCodes.REQUEST_IN_PROGRESS,
          );
        }
        if (fingerPrint !== data.fingerPrint) {
          throw new IdempotencyError(
            "Idempotency-Key is already used",
            IdempotencyErrorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH,
          );
        }
        if (data.response?.error) {
          // don't return cached uncaught errors, allow to retry
          return undefined
        }

        return data.response;
      }
    }
  }

  /**
   * to be called on receiving response/error, it cached the response/error and updates status to complete.
   * subsequent requests can use cached response.
   */
  async onResponse<BodyType, ErrorType>(
    req: IdempotencyParams,
    res: IdempotencyResponse<BodyType, ErrorType>,
  ): Promise<void> {
    const reqInternal = this.getInternalRequest(req);
    if (await this.isEnabled(reqInternal)) {
      const fingerPrint = this.getFingerPrint(reqInternal);
      const cacheKey = this.getIdempotencyCacheKey(reqInternal);
      const payload: StoragePayload = {
        status: RequestStatusEnum.COMPLETE,
        fingerPrint,
        response: res,
      };
      await this.storage.set(cacheKey, JSON.stringify(payload), {
        ttl: reqInternal.options.cacheTTLMS,
      });
    }
  }
}
