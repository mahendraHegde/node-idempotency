export enum errorCodes {
  IDEMPOTENCY_KEY_LEN_EXEEDED = "IDEMPOTENCY_KEY_LEN_EXEEDED",
  IDEMPOTENCY_KEY_MISSING = "IDEMPOTENCY_KEY_MISSING",
  IDEMPOTENCY_FINGERPRINT_MISSMATCH = "IDEMPOTENCY_FINGERPRINT_MISSMATCH",
  REQUEST_IN_PROGRESS = "REQUEST_IN_PROGRESS",
}

interface HttpData {
  headers?: Record<string, unknown>;
  statusCode?: number;
}
export class IdempotentHTTPError extends Error {
  code: errorCodes;
  meta?: Record<string, unknown>;
  httpData?: HttpData;
  constructor(
    message: string,
    code: errorCodes,
    httpData?: HttpData,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.meta = meta;
    this.httpData = httpData;
  }
}
