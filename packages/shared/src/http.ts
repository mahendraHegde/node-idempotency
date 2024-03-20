import { idempotencyErrorCodes } from "@node-idempotency/core";

export const idempotency2HttpCodeMap: Record<idempotencyErrorCodes, number> = {
  [idempotencyErrorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH]: 422,
  [idempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED]: 400,
  [idempotencyErrorCodes.IDEMPOTENCY_KEY_MISSING]: 400,
  [idempotencyErrorCodes.REQUEST_IN_PROGRESS]: 409,
};

export const headers2Cache: Record<string, string> = {
  contentType: "Content-Type",
};

export enum HTTPHeaderEnum {
  idempotentReplayed = "Idempotent-Replayed",
  retryAfter = "Retry-After",
}
