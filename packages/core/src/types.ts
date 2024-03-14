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
  idempotencyKey?: string;
  keyMaxLength?: number;
  cacheKeyPrefix?: string;
  cacheTTLMS?: number;
  enforceIdempotency?: boolean;
}
export interface IdempotencyParams {
  headers: Record<string, unknown>;
  path: string;
  body?: Record<string, unknown>;
  method?: HTTPMethods;
  options?: Options;
}

export interface IdempotencyParamsInternal extends IdempotencyParams {
  options: Required<Options>;
}

export enum RequestStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
}

export enum HttpResponseHeaderKeysEnum {
  IDEMPOTENCY_KEY = "Idempotency-Key",
}

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
