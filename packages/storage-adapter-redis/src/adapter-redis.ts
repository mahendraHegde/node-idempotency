import { type StorageAdapter } from "@node-idempotency/storage";
import { createClient } from "redis";
import { type RedisStorageAdapterOptions } from "./types";

export class RedisStorageAdapter implements StorageAdapter {
  private readonly client: ReturnType<typeof createClient>;
  constructor(options?: RedisStorageAdapterOptions) {
    this.client = createClient(options);
    this.client.on("error", (err) => {
      console.log("Redis Client Error", err);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (err) {
      console.warn(`failed to disconnect redis client`, err);
    }
  }

  async setIfNotExists(
    key: string,
    val: string,
    { ttl }: { ttl?: number | undefined } = {},
  ): Promise<boolean> {
    const res = await this.client.set(key, val, {
      NX: true,
      PX: ttl,
    });
    if (res) {
      return true;
    }
    return false;
  }

  async set(
    key: string,
    val: string,
    { ttl }: { ttl?: number | undefined },
  ): Promise<void> {
    await this.client.set(key, val, { PX: ttl });
  }

  async get(key: string): Promise<string | undefined> {
    const val = await this.client.get(key);
    return val ?? undefined;
  }
}
