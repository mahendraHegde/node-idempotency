import { Idempotency } from "./idempotency";
import type { StorageAdapter } from "@node-idempotency/storage";
import type {
  IdempotencyOptions,
  IdempotencyParams,
  IdempotencyResponse,
} from "./types";

/**
 * Decorator factory to make a function idempotent using the Idempotency class.
 *
 * Usage:
 *
 * @MakeIdemPotent({
 *   storage: myStorageAdapter,
 *   optionBuilder?: (...args) => ({
 *     headers: ...,
 *     body: ...,
 *     method: ...,
 *     path: ...,
 *     options?: ...,
 *   })
 * })
 * async function myHandler(...) { ... }
 */
interface MakeIdemPotentOptions {
  storage: StorageAdapter;
  options?: IdempotencyOptions;
  requestBuilder: (...args: any[]) => IdempotencyParams;
}

export function MakeIdemPotent({
  storage,
  options,
  requestBuilder,
}: MakeIdemPotentOptions) {
  const idempotency = new Idempotency(storage,options);

  return function (
    _: any,
    __: string,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Build IdempotencyParams from args
      const params: IdempotencyParams = requestBuilder(...args);

      // Try to get cached response
      const cached = await idempotency.onRequest(params);
      if (cached !== undefined) {
        return cached;
      }

      // Call the original method
      let result: any;
      let error: any;
      try {
        result = await originalMethod.apply(this, args);
      } catch (err) {
        error = err;
        throw err;
      } finally {
        // Cache the response or error
        const response: IdempotencyResponse<any, any> = error
          ? { error }
          : { body: result };
        await idempotency.onResponse(params, response);
      }
      return result;
    };

    return descriptor;
  };
}
