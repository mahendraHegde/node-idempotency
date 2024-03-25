import { RedisStorageAdapter } from "../../src";
import { RedisMemoryServer } from "redis-memory-server";

describe("Redis Adapter", () => {
  let storage: RedisStorageAdapter;
  let redisServer: RedisMemoryServer;

  beforeAll(async () => {
    redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();
    const url = `redis://${host}:${port}`;
    storage = new RedisStorageAdapter({ url });
    await storage.connect();
  });

  afterAll(async () => {
    await storage.disconnect();
    await redisServer.stop();
  });

  describe("setIfNotExists", () => {
    it("should set and return true when key not exist", async () => {
      const res = await storage.setIfNotExists("k1", "v1");
      expect(res).toBe(true);
      const val = await storage.get("k1");
      expect(val).toBe("v1");
    });
    it("should not set and return false when key exist", async () => {
      await storage.set("k2", "v1", {});
      const res = await storage.setIfNotExists("k2", "v2");
      expect(res).toBe(false);
      const val = await storage.get("k2");
      expect(val).toBe("v1");
    });
  });

  describe("set/get", () => {
    it("should set and return the value on get", async () => {
      let val = await storage.get("k3");
      expect(val).toBeUndefined();
      await storage.set("k3", "v1", {});
      val = await storage.get("k3");
      expect(val).toBe("v1");
    });
    it("should set and return undefined on get when ttl expired", async () => {
      let val = await storage.get("k4");
      expect(val).toBeUndefined();
      await storage.set("k4", "v1", { ttl: 500 });
      val = await storage.get("k4");
      expect(val).toBe("v1");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      val = await storage.get("k4");
      expect(val).toBeUndefined();
    });
  });
});
