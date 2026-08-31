export interface IdempotencyOptions {
  /**
   * @defaultValue `idempotency-key`
   *
   * How to obtain the idempotency key for a request. Either:
   * - a `string`: the (case-insensitive) header name to read the key from; or
   * - a function `(req) => string | undefined`: derive the key from the request
   *   — its headers, body, method, path, or the raw framework `request` a plugin
   *   passes through. Return `undefined` to treat the request as non-idempotent.
   *   Useful to key off a body field, or to namespace the key (e.g. per tenant).
   */
  idempotencyKey?: string | IdempotencyKeyResolver;
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
  /**
   * @defaultValue `false`
   *
   * if set to `true` responses with errors will not be cached
   */
  skipErrorsCache?: boolean;

  /**
   * Strategy for handling in-progress requests for the same Idempotency-Key.
   * @defaultValue { wait: false, pollingIntervalMs: 100, maxWaitMs: 5000 }
   *
   * - wait: If true, when a request is in progress for the same Idempotency-Key,
   *         this request will wait for the in-progress request to complete and return
   *         the cached response, instead of throwing an error.
   * - pollingIntervalMs: How often (ms) to poll for completion.
   * - maxWaitMs: Maximum time (ms) to wait before timing out.
   */
  inProgressStrategy?: {
    wait?: boolean;
    pollingIntervalMs?: number;
    maxWaitMs?: number;
  };

  /**
   * @defaultValue `undefined`
   *
   * custom way to specify which request to skip and which to accept
   */
  skipRequest?: (
    req: IdempotencyParamsWithDefaults,
  ) => boolean | Promise<boolean>;
}

export interface IdempotencyParams {
  headers: Record<string, unknown>;
  path: string;
  body?: Record<string, unknown>;
  method?: string;
  options?: IdempotencyOptions;
  /**
   * The raw framework request (e.g. the Express `Request`), passed through by
   * plugins so an {@link IdempotencyKeyResolver} (or `skipRequest`) can read
   * framework-specific context such as the authenticated user/tenant. Left as
   * `unknown` to keep the core framework-agnostic — resolvers cast it.
   */
  request?: unknown;
}

/**
 * Derives the idempotency key from a request. Return `undefined` to treat the
 * request as non-idempotent. Receives the same params the core operates on,
 * including the raw framework {@link IdempotencyParams.request} when a plugin
 * provides it.
 */
export type IdempotencyKeyResolver = (
  req: IdempotencyParams,
) => string | undefined;

export interface IdempotencyParamsWithDefaults extends IdempotencyParams {
  options: Required<Omit<IdempotencyOptions, "skipRequest">> & {
    skipRequest?: IdempotencyOptions["skipRequest"];
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
