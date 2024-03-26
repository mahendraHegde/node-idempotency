import {
  type DynamicModule,
  Module,
  type OnModuleDestroy,
  Inject,
} from "@nestjs/common";
import { NodeIdempotencyInterceptor } from "./interceptors/node-idempotency.iterceptor";
import {
  buildStorageAdapter,
  type IdempotencyPluginOptions,
} from "@node-idempotency/shared";
import { IDEMPOTENCY_OPTIONS, IDEMPOTENCY_STORAGE } from "./constants";
import { StorageAdapter } from "@node-idempotency/storage";

@Module({
  exports: [
    NodeIdempotencyInterceptor,
    IDEMPOTENCY_STORAGE,
    IDEMPOTENCY_OPTIONS,
  ],
})
export class NodeIdempotencyModule implements OnModuleDestroy {
  constructor(
    @Inject(IDEMPOTENCY_STORAGE)
    private readonly stoarge: StorageAdapter,
  ) {}

  async onModuleDestroy(): Promise<void> {
    if (typeof this.stoarge.disconnect === "function") {
      await this.stoarge.disconnect();
    }
  }

  static forRootAsync(options: IdempotencyPluginOptions): DynamicModule {
    return {
      global: true,
      module: NodeIdempotencyModule,
      providers: [
        NodeIdempotencyInterceptor,
        {
          provide: IDEMPOTENCY_STORAGE,
          useFactory: async () => {
            return await buildStorageAdapter(options.storage);
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
