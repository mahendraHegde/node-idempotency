import { type DynamicModule, Module } from "@nestjs/common";
import { NodeIdempotencyInterceptor } from "./interceptors/node-idempotency.iterceptor";
import { type Options } from "@node-idempotency/core";
import { StorageAdapterEnum } from "./types";
import { type StorageAdapter } from "@node-idempotency/storage";
import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory";
import { Reflector } from "@nestjs/core";
import { IDEMPOTENCY_OPTIONS, IDEMPOTENCY_STORAGE } from "./constants";

@Module({
  exports: [
    NodeIdempotencyInterceptor,
    IDEMPOTENCY_STORAGE,
    IDEMPOTENCY_OPTIONS,
  ],
})
export class NodeIdempotencyModule {
  static forRootAsync(
    options: Options & { storageAdapter: StorageAdapterEnum | StorageAdapter },
  ): DynamicModule {
    return {
      global: true,
      module: NodeIdempotencyModule,
      providers: [
        NodeIdempotencyInterceptor,
        {
          provide: IDEMPOTENCY_STORAGE,
          useFactory: () => {
            let stoarge: StorageAdapter;
            if (typeof options.storageAdapter === "string") {
              switch (options.storageAdapter) {
                case StorageAdapterEnum.memory: {
                  stoarge = new MemoryStorageAdapter();
                  break;
                }
                default:
                  throw new Error(
                    `Invalid storageAdapter specified allowerd values are ${Object.values(StorageAdapterEnum).join(", ")}`,
                  );
              }
            } else {
              stoarge = options.storageAdapter;
            }
            return stoarge;
          },
          inject: [],
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
