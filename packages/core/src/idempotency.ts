import { type StorageAdapter } from "@node-idempotency/storage";
import {
  HttpHeaderKeysEnum,
  type IdempotencyParams,
  type IdempotencyParamsInternal,
  type IdempotencyResponse,
  type Options,
  RequestStatusEnum,
  type StoragePayload,
} from "./types";
import {
  IDEMPOTENCY_CACHE_KEY_PREFIX,
  IDEMPOTENCY_CACHE_TTL_MS,
  IDEMPOTENCY_KEY_LEN,
} from "./constants";
import { IdempotencyError, idempotencyErrorCodes } from "./error";
import { createHash } from "crypto";
export class Idempotency {
  options: Required<Options>;
  constructor(
    private readonly storage: StorageAdapter,
    options?: Options,
  ) {
    this.options = {
      allowedMethods: [],
      excludeMethods: [],
      cacheKeyPrefix: IDEMPOTENCY_CACHE_KEY_PREFIX,
      idempotencyKey: HttpHeaderKeysEnum.IDEMPOTENCY_KEY.toLocaleLowerCase(),
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

  private getInternalRequest(
    req: IdempotencyParams,
  ): IdempotencyParamsInternal {
    return {
      ...req,
      options: this.buildRequestOptions(req.options),
    };
  }

  private getIdempotencyKey(
    req: IdempotencyParamsInternal,
  ): string | undefined {
    const key = Object.keys(req.headers).find(
      (key) => key.toLowerCase() === req.options.idempotencyKey.toLowerCase(),
    );
    return key ? (req.headers[key] as string) : undefined;
  }

  private isEnabled(req: IdempotencyParamsInternal): boolean {
    if (
      req.method &&
      req.options.allowedMethods?.length &&
      !req.options.allowedMethods.includes(req.method)
    ) {
      return false;
    }
    if (req.method && req.options.excludeMethods?.includes(req.method)) {
      return false;
    }
    const idempotencyKey = this.getIdempotencyKey(req);
    if (!idempotencyKey) {
      if (req.options?.enforceIdempotency) {
        throw new IdempotencyError(
          "Idempotency-Key is missing",
          idempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
        );
      }
      return false;
    }
    return true;
  }

  private validateRequest(req: IdempotencyParamsInternal): void {
    const idempotencyKey = this.getIdempotencyKey(req)!;
    if (idempotencyKey.length > req.options.keyMaxLength) {
      throw new IdempotencyError(
        "Idempotency-Key length exceeds max allowed length",
        idempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
      );
    }
  }

  private getIdempotencyCacheKey(req: IdempotencyParamsInternal): string {
    const idempotencyKey = this.getIdempotencyKey(req);
    const { path, method } = req;
    return `${req.options.cacheKeyPrefix}:${method}:${path}:${idempotencyKey}`;
  }

  private hash(body: Record<string, unknown>): string {
    const hash = createHash("blake2s256");
    hash.update(Buffer.from(JSON.stringify(body)));

    return hash.digest("hex");
  }

  private getFingerPrint(req: IdempotencyParamsInternal): string | undefined {
    return req.body ? this.hash(req.body) : undefined;
  }

  async onRequest<BodyType, ErrorType>(
    req: IdempotencyParams,
  ): Promise<IdempotencyResponse<BodyType, ErrorType> | undefined> {
    const reqInternal: IdempotencyParamsInternal = this.getInternalRequest(req);
    if (this.isEnabled(reqInternal)) {
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
            idempotencyErrorCodes.REQUEST_IN_PROGRESS,
          );
        } else {
          if (fingerPrint !== data.fingerPrint) {
            throw new IdempotencyError(
              "Idempotency-Key is already used",
              idempotencyErrorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH,
            );
          }
          return data.response;
        }
      }
    }
  }

  async onResponse<BodyType, ErrorType>(
    req: IdempotencyParams,
    res: IdempotencyResponse<BodyType, ErrorType>,
  ): Promise<void> {
    const reqInternal = this.getInternalRequest(req);
    if (this.isEnabled(reqInternal)) {
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
