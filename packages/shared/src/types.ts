import { type IdempotencyOptions } from "@node-idempotency/core";
import { type StorageAdapter } from "@node-idempotency/storage";
export enum StorageAdapterEnum {
  memory = "memory",
}

export type IdempotencyPluginOptions = IdempotencyOptions & {
  storageAdapter: StorageAdapterEnum | StorageAdapter;
};
