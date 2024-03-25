export interface IdempotencyOptions {
  /**
   * @defaultValue `idempotency-key`
   *
   * specifies the header key to look for to get idempotency key
   * case insensitive.
   */
  idempotencyKey?: string;
  /**
   * @defaultValue `256`
   *
   * restricts max length of idempotency key
   */
  keyMaxLength?: number;
  /**
   * @defaultValue `node-idempotency`
   *
   * prefix/namespace for cache key
   */
  cacheKeyPrefix?: string;
  /**
   * @defaultValue `1000 * 60 * 60 * 24(1 day)`
   *
   * ttl for idempotency
   */
  cacheTTLMS?: number;
  /**
   * @defaultValue `false`
   *
   * if set to `true` requests without idempotency key header will be rejected
   */
  enforceIdempotency?: boolean;
}
export interface IdempotencyParams {
  headers: Record<string, unknown>;
  path: string;
  body?: Record<string, unknown>;
  method?: string;
  options?: IdempotencyOptions;
}

/** @ignore */
export interface IdempotencyParamsInternal extends IdempotencyParams {
  options: Required<IdempotencyOptions>;
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
