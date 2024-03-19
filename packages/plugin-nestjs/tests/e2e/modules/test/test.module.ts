import { Module } from "@nestjs/common";
import {
  NodeIdempotencyModule,
  StorageAdapterEnum,
} from "../../../../src/index";
import { TestController } from "./test.controller";

@Module({
  imports: [
    NodeIdempotencyModule.forRootAsync({
      storageAdapter: StorageAdapterEnum.memory,
    }),
  ],
  controllers: [TestController],
})
export class TestModule {}
