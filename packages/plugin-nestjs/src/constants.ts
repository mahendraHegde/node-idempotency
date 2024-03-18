import { HttpStatus } from '@nestjs/common'
import { idempotencyErrorCodes } from '@node-idempotency/core'

export const IDEMPOTENCY_OPTIONS = 'node_idempotency:IDEMPOTENCY_OPTIONS'
export const IDEMPOTENCY_STORAGE = 'node_idempotency:IDEMPOTENCY_STORAGE'

export const IDEMPOTENCY_REPLAYED_HEADER = 'Idempotent-Replayed'

export const idempotency2HttpCodeMap: Record<
idempotencyErrorCodes,
HttpStatus
> = {
  [idempotencyErrorCodes.IDEMPOTENCY_FINGERPRINT_MISSMATCH]:
    HttpStatus.UNPROCESSABLE_ENTITY,
  [idempotencyErrorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED]: HttpStatus.BAD_REQUEST,
  [idempotencyErrorCodes.IDEMPOTENCY_KEY_MISSING]: HttpStatus.BAD_REQUEST,
  [idempotencyErrorCodes.REQUEST_IN_PROGRESS]: HttpStatus.CONFLICT
}

export const headers2Cache: Record<string, string> = {
  contentType: 'Content-Type'
}
