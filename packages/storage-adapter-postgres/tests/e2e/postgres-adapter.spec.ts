import { Pool } from "pg";
import { PostgresMock } from "pgmock";
import { setTimeout } from "timers/promises";
import { PostgresStorageAdapter } from "../../src";
import { DEFAULT_IDEMPOTENCY_OPTS } from "../../src/defaults";

describe("Postgres Adapter", () => {
  let storage: PostgresStorageAdapter;
  let mock: PostgresMock;
  let pool: Pool;

  beforeAll(async () => {
    mock = await PostgresMock.create();
    const connectionStr = await mock.listen(5432);
    pool = new Pool({ connectionString: connectionStr });
    storage = new PostgresStorageAdapter({ pool });

    await pool.query(
      `DROP SCHEMA IF EXISTS
        "${DEFAULT_IDEMPOTENCY_OPTS.idempotencySchemaName}" CASCADE;`,
    );

    await storage.connect();
  }, 30_000);

  afterAll(async () => {
    await storage.disconnect();
    await pool.end();
    mock.destroy();
  });

  describe("setIfNotExists", () => {
    it("should set and return true when key not exist", async () => {
      const res = await storage.setIfNotExists("k1", "v1", {});
      expect(res).toBe(true);
      const val = await storage.get("k1");
      expect(val).toBe("v1");
    });
    it("should not set and return false when key exist", async () => {
      await storage.set("k2", "v1", {});
      const res = await storage.setIfNotExists("k2", "v2", {});
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

      await setTimeout(1000);

      val = await storage.get("k4");
      expect(val).toBeUndefined();

      // should overwrite the value now
      await storage.setIfNotExists("k4", "v2", {});
      val = await storage.get("k4");
      expect(val).toBe("v2");
    });

    it("should clear expired entities", async () => {
      await storage.set("k5", "v5", { ttl: 500 });
      expect(await storage.get("k5")).toBe("v5");

      await setTimeout(1000);
      await storage.clearExpiredEntries();

      const { rows } = await pool.query(
        `SELECT * FROM "${DEFAULT_IDEMPOTENCY_OPTS.idempotencySchemaName}"."${DEFAULT_IDEMPOTENCY_OPTS.idempotencyTableName}"
        WHERE key = $1`,
        ["k5"],
      );
      expect(rows).toHaveLength(0);
    });
  });
});
