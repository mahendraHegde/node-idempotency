import { type DynamicModule, Module } from "@nestjs/common";
import { NodeIdempotencyInterceptor } from "./interceptors/node-idempotency.iterceptor";
import {
  buildStorageAdapter,
  type IdempotencyPluginOptions,
} from "@node-idempotency/shared";
import { IDEMPOTENCY_OPTIONS, IDEMPOTENCY_STORAGE } from "./constants";

@Module({
  exports: [
    NodeIdempotencyInterceptor,
    IDEMPOTENCY_STORAGE,
    IDEMPOTENCY_OPTIONS,
  ],
})
export class NodeIdempotencyModule {
  static forRootAsync(options: IdempotencyPluginOptions): DynamicModule {
    return {
      global: true,
      module: NodeIdempotencyModule,
      providers: [
        NodeIdempotencyInterceptor,
        {
          provide: IDEMPOTENCY_STORAGE,
          useFactory: async () => {
            return await buildStorageAdapter(options.storageAdapter);
          },
        },
        {
          provide: IDEMPOTENCY_OPTIONS,
          useValue: options,
        },
      ],
      exports: [NodeIdempotencyInterceptor],
    };
  }
}
