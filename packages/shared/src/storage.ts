import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory";
import { RedisStorageAdapter } from "@node-idempotency/storage-adapter-redis";
import { type StorageAdapterArg, StorageAdapterEnum } from "./types";
import { type StorageAdapter } from "@node-idempotency/storage";

export const buildStorageAdapter = async (
  storage: StorageAdapterArg,
): Promise<StorageAdapter> => {
  let storageAdapter: StorageAdapter;
  if (typeof storage.adapter === "string") {
    switch (storage.adapter) {
      case StorageAdapterEnum.memory: {
        storageAdapter = new MemoryStorageAdapter();
        break;
      }
      case StorageAdapterEnum.redis: {
        storageAdapter = new RedisStorageAdapter(storage.options);
        if (typeof storageAdapter.connect === "function")
          await storageAdapter.connect();
        break;
      }
      default:
        throw new Error(
          `Invalid storageAdapter specified allowerd values are ${Object.values(StorageAdapterEnum).join(", ")}`,
        );
    }
  } else {
    storageAdapter = storage.adapter;
  }
  return storageAdapter;
};
