import { type Options } from '@node-idempotency/core'
import { IDEMPOTENCY_OPTIONS } from '../constants'
import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common'
import { NodeIdempotencyInterceptor } from '../interceptors/node-idempotency.iterceptor'

/**
 * Creates a idempotency interceptor.
 * @param options idempotency options.
 */
export function Idempotent (
  options?: Options
): MethodDecorator & ClassDecorator {
  SetMetadata(IDEMPOTENCY_OPTIONS, options)
  return UseInterceptors(NodeIdempotencyInterceptor)
}
