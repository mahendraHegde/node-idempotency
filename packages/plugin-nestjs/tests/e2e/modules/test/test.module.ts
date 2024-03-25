import { type DynamicModule, Module } from "@nestjs/common";
import {
  NodeIdempotencyModule,
  StorageAdapterEnum,
} from "../../../../src/index";
import { TestController } from "./test.controller";

@Module({})
export class TestModuleMemory {
  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: TestModuleMemory,
      imports: [
        NodeIdempotencyModule.forRootAsync({
          storage: { adapter: StorageAdapterEnum.memory },
          cacheTTLMS: 1000,
        }),
      ],
      controllers: [TestController],
    };
  }
}

@Module({})
export class TestModuleRedis {
  static forRootAsync(options: { port: number; host: string }): DynamicModule {
    return {
      global: true,
      module: TestModuleRedis,
      controllers: [TestController],
      imports: [
        NodeIdempotencyModule.forRootAsync({
          storage: {
            adapter: StorageAdapterEnum.redis,
            options: {
              url: `redis://${options.host}:${options.port}`,
            },
          },
          cacheTTLMS: 1000,
        }),
      ],
    };
  }
}
