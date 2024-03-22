import { IdempotencyErrorCodes } from "@node-idempotency/core";

export const idempotency2HttpCodeMap: Record<IdempotencyErrorCodes, number> = {
  [IdempotencyErrorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH]: 422,
  [IdempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED]: 400,
  [IdempotencyErrorCodes.IDEMPOTENCY_KEY_MISSING]: 400,
  [IdempotencyErrorCodes.REQUEST_IN_PROGRESS]: 409,
};

export const headers2Cache: Record<string, string> = {
  contentType: "Content-Type",
};

export enum HTTPHeaderEnum {
  idempotentReplayed = "Idempotent-Replayed",
  retryAfter = "Retry-After",
}
