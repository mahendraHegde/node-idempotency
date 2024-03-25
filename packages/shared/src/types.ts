import { type IdempotencyOptions } from "@node-idempotency/core";
import { type StorageAdapter } from "@node-idempotency/storage";
import { type RedisStorageAdapterOptions } from "@node-idempotency/storage-adapter-redis";
export enum StorageAdapterEnum {
  memory = "memory",
  redis = "redis",
}
export type StorageAdapterOptions = RedisStorageAdapterOptions;

export interface StorageAdapterArg {
  adapter: StorageAdapterEnum | StorageAdapter;
  options?: StorageAdapterOptions;
}
export type IdempotencyPluginOptions = IdempotencyOptions & {
  storage: StorageAdapterArg;
};
