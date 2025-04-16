import {
  type DynamicModule,
  Module,
  type OnModuleDestroy,
  Inject,
  type Provider,
} from "@nestjs/common";
import { NodeIdempotencyInterceptor } from "./interceptors/node-idempotency.interceptor";
import {
  buildStorageAdapter,
  type IdempotencyPluginOptions,
} from "@node-idempotency/shared";
import { IDEMPOTENCY_OPTIONS, IDEMPOTENCY_STORAGE } from "./constants";
import { StorageAdapter } from "@node-idempotency/storage";
import { type RootAsyncRegisterOptions } from "./types";

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
    private readonly storage: StorageAdapter,
  ) {}

  async onModuleDestroy(): Promise<void> {
    if (typeof this.storage.disconnect === "function") {
      await this.storage.disconnect();
    }
  }

  static async forRootAsync(
    registerOptions: RootAsyncRegisterOptions,
  ): Promise<DynamicModule> {
    const providers = await this.buildProviders(registerOptions);
    return {
      global: true,
      module: NodeIdempotencyModule,
      providers,
      imports: "imports" in registerOptions ? registerOptions.imports : [],
      exports: [NodeIdempotencyInterceptor],
    };
  }

  private static async buildProviders(
    registerOptions: RootAsyncRegisterOptions,
  ): Promise<Provider[]> {
    const providers: Provider[] = [NodeIdempotencyInterceptor];
    const storageProvider = {
      provide: IDEMPOTENCY_STORAGE,
      useFactory: async (options: IdempotencyPluginOptions) => {
        return await buildStorageAdapter(options.storage);
      },
      inject: [IDEMPOTENCY_OPTIONS],
    };

    if ("storage" in registerOptions) {
      providers.push({
        provide: IDEMPOTENCY_OPTIONS,
        useValue: registerOptions,
      });
    } else if (
      "useFactory" in registerOptions &&
      typeof registerOptions.useFactory === "function"
    ) {
      providers.push({
        provide: IDEMPOTENCY_OPTIONS,
        useFactory: registerOptions.useFactory,
        inject: registerOptions.inject,
      });
    }
    providers.push(storageProvider);
    return providers;
  }
}
