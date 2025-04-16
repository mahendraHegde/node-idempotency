import { type IdempotencyOptions } from "@node-idempotency/core";
import { IDEMPOTENCY_OPTIONS } from "../constants";
import { SetMetadata, UseInterceptors, applyDecorators } from "@nestjs/common";
import { NodeIdempotencyInterceptor } from "../interceptors/node-idempotency.interceptor";

/**
 * Creates a idempotency interceptor.
 * @param options idempotency options.
 */
export function Idempotent(
  options?: IdempotencyOptions,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(IDEMPOTENCY_OPTIONS, options),
    UseInterceptors(NodeIdempotencyInterceptor),
  );
}
