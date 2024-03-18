import { Module } from "@nestjs/common";
import {
  NodeIdempotencyModule,
  StorageAdapterEnum,
} from "../../../../src/index";
import { ExpressController } from "./test.controller";

@Module({
  imports: [
    NodeIdempotencyModule.forRootAsync({
      storageAdapter: StorageAdapterEnum.memory,
    }),
  ],
  controllers: [ExpressController],
})
export class TestModule {}
