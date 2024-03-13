export type HTTPMethods =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export interface Options {
  allowedMethods?: HTTPMethods[];
  excludeMethods?: HTTPMethods[];
  headerKey?: string;
  keyMaxLength?: number;
  cacheKeyPrefix?: string;
  cacheTTLMS?: number;
  enforceIdempotency?: boolean;
}
export interface IdempotencyParams {
  headers: Record<string, unknown>;
  path: string;
  body?: Record<string, unknown>;
  method: HTTPMethods;
  options?: Options;
}

export enum RequestStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum HttpResponseHeaderKeysEnum {
  RETRY_AFTER = "Retry-After",
  IDEMPOTENCY_KEY = "Idempotency-Key",
  IDEMPOTENCY_REPLAY = "Idempotency-Replay",
}

export interface StoragePayload<BodyType = unknown, ErrorType = unknown> {
  status: RequestStatusEnum;
  fingerPrint?: string;
  response?: IdempotencyResponse<BodyType, ErrorType>;
}

export interface IdempotencyResponse<BodyType = unknown, ErrorType = unknown> {
  headers: Record<string, unknown>;
  body?: BodyType;
  statusCode: number;
  error?: ErrorType;
}
