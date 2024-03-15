import { type StorageAdapter } from "@node-idempotency/storage";
import {
  HttpResponseHeaderKeysEnum,
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
import { IdempotencyError, errorCodes } from "./error";
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
      idempotencyKey:
        HttpResponseHeaderKeysEnum.IDEMPOTENCY_KEY.toLocaleLowerCase(),
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
    const idempotencyKey = req.headers[req.options.idempotencyKey];
    if (!idempotencyKey) {
      if (req.options?.enforceIdempotency) {
        throw new IdempotencyError(
          "Idempotency-Key is missing",
          errorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
        );
      }
      return false;
    }
    return true;
  }

  private validateRequest(req: IdempotencyParamsInternal): void {
    const idempotencyKey = req.headers[req.options.idempotencyKey] as string;
    if (idempotencyKey.length > req.options.keyMaxLength) {
      throw new IdempotencyError(
        "Idempotency-Key length exceeds max allowed length",
        errorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED,
      );
    }
  }

  private getIdempotencyKey(req: IdempotencyParamsInternal): string {
    const idempotencyKey = req.headers[req.options.idempotencyKey] as string;
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
      const cacheKey = this.getIdempotencyKey(reqInternal);
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
            errorCodes.REQUEST_IN_PROGRESS,
          );
        } else {
          if (fingerPrint !== data.fingerPrint) {
            throw new IdempotencyError(
              "Idempotency-Key is already used",
              errorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH,
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
      const cacheKey = this.getIdempotencyKey(reqInternal);
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
