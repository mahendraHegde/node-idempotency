import { type StorageAdapter } from "@node-idempotency/storage";
import { type CacheItem } from "./types";

export class MemoryStorageAdapter implements StorageAdapter {
  private readonly cache = new Map<string, CacheItem>();

  private buildCacheValue(val: string, ttl?: number): CacheItem {
    const v: CacheItem = {
      item: val,
      ttl,
    };
    if (ttl !== undefined && !isNaN(ttl)) {
      const date = new Date();
      date.setMilliseconds(date.getMilliseconds() + ttl);
      v.ttl = date.getTime();
    }
    return v;
  }

  async setIfNotExists(
    key: string,
    val: string,
    { ttl }: { ttl?: number | undefined } = {},
  ): Promise<boolean> {
    if (!this.cache.get(key)) {
      this.cache.set(key, this.buildCacheValue(val, ttl));
      return true;
    }
    return false;
  }

  async set(
    key: string,
    val: string,
    { ttl }: { ttl?: number | undefined },
  ): Promise<void> {
    this.cache.set(key, this.buildCacheValue(val, ttl));
  }

  async get(key: string): Promise<string | undefined> {
    const val = this.cache.get(key);
    if (val?.ttl && !isNaN(val.ttl)) {
      if (new Date() > new Date(val.ttl)) {
        this.cache.delete(key);
        return undefined;
      }
    }
    return val?.item;
  }
}
