export interface IdempotencyOptions {
  /**
   * specifies the header key to look for to get idempotency key case insensitive.
   * @defaultValue `idempotency-key`
   */
  idempotencyKey?: string;
  /**
   * restricts max length of idempotency key
   * @defaultValue `256`
   */
  keyMaxLength?: number;
  /**
   * prefix/namespace for cache key
   * @defaultValue `node-idempotency`
   */
  cacheKeyPrefix?: string;
  /**
   * ttl for idempotency
   * @defaultValue `1000 * 60 * 60 * 24(1 day)`
   */
  cacheTTLMS?: number;
  /**
   * if set to `true` requests without idempotency key header will be rejected
   * @defaultValue false
   */
  enforceIdempotency?: boolean;

  /**
   * custom way to specify which request to skip and which to accept
   * @defaultValue undefined
   */
  skipRequest?: (
    req: IdempotencyParamsWithDefaults,
  ) => boolean | Promise<boolean>;

  getExtendsKey?: (
    req: IdempotencyParamsWithDefaults,
  ) => string | Promise<string>;
}

export interface IdempotencyParams {
  headers: Record<string, unknown>;
  path: string;
  body?: Record<string, unknown>;
  method?: string;
  options?: IdempotencyOptions;
}

export interface IdempotencyParamsWithDefaults extends IdempotencyParams {
  options: Required<
    Omit<IdempotencyOptions, "skipRequest" | "getExtendsKey">
  > & {
    skipRequest?: IdempotencyOptions["skipRequest"];
    getExtendsKey?: IdempotencyOptions["getExtendsKey"];
  };
}

/** @ignore */
export enum RequestStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
}

/** @ignore */
export enum HttpHeaderKeysEnum {
  IDEMPOTENCY_KEY = "Idempotency-Key",
}

/** @ignore */
export interface StoragePayload<BodyType = unknown, ErrorType = unknown> {
  status: RequestStatusEnum;
  fingerPrint?: string;
  response?: IdempotencyResponse<BodyType, ErrorType>;
}

export interface IdempotencyResponse<BodyType = unknown, ErrorType = unknown> {
  body?: BodyType;
  additional?: Record<string, unknown>;
  error?: ErrorType;
}
