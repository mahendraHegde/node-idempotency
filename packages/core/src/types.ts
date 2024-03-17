export interface Options {
  allowedMethods?: string[]
  excludeMethods?: string[]
  idempotencyKey?: string
  keyMaxLength?: number
  cacheKeyPrefix?: string
  cacheTTLMS?: number
  enforceIdempotency?: boolean
}
export interface IdempotencyParams {
  headers: Record<string, unknown>
  path: string
  body?: Record<string, unknown>
  method?: string
  options?: Options
}

export interface IdempotencyParamsInternal extends IdempotencyParams {
  options: Required<Options>
}

export enum RequestStatusEnum {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}

export enum HttpResponseHeaderKeysEnum {
  IDEMPOTENCY_KEY = 'Idempotency-Key',
}

export interface StoragePayload<BodyType = unknown, ErrorType = unknown> {
  status: RequestStatusEnum
  fingerPrint?: string
  response?: IdempotencyResponse<BodyType, ErrorType>
}

export interface IdempotencyResponse<BodyType = unknown, ErrorType = unknown> {
  body?: BodyType
  additional?: Record<string, unknown>
  error?: ErrorType
}
