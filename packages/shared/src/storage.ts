import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory";
import { StorageAdapterEnum } from "./types";
import { type StorageAdapter } from "@node-idempotency/storage";

export const buildStorageAdapter = async (
  storage: StorageAdapterEnum | StorageAdapter,
): Promise<StorageAdapter> => {
  let storageAdapter: StorageAdapter;
  if (typeof storage === "string") {
    switch (storage) {
      case StorageAdapterEnum.memory: {
        storageAdapter = new MemoryStorageAdapter();
        break;
      }
      default:
        throw new Error(
          `Invalid storageAdapter specified allowerd values are ${Object.values(StorageAdapterEnum).join(", ")}`,
        );
    }
  } else {
    storageAdapter = storage;
  }
  return storageAdapter;
};
