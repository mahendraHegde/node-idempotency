export enum IdempotencyErrorCodes {
  IDEMPOTENCY_KEY_LEN_EXEEDED = "IDEMPOTENCY_KEY_LEN_EXEEDED",
  IDEMPOTENCY_KEY_MISSING = "IDEMPOTENCY_KEY_MISSING",
  IDEMPOTENCY_FINGERPRINT_MISSMATCH = "IDEMPOTENCY_FINGERPRINT_MISSMATCH",
  REQUEST_IN_PROGRESS = "REQUEST_IN_PROGRESS",
}

export class IdempotencyError extends Error {
  code: IdempotencyErrorCodes;
  meta?: Record<string, unknown>;
  constructor(
    message: string,
    code: IdempotencyErrorCodes,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
