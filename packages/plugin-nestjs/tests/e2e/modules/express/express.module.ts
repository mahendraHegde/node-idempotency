import { Module } from '@nestjs/common'
import {
  NodeIdempotencyModule,
  StorageAdapterEnum
} from '../../../../src/index'
import { ExpressController } from './express.controller'

@Module({
  imports: [
    NodeIdempotencyModule.forRootAsync({
      storageAdapter: StorageAdapterEnum.memory
    })
  ],
  controllers: [ExpressController]
})
export class ExpressModule {}
