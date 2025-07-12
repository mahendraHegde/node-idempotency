import {
  type PostgresIdempotencyOpts,
  type PostgresAdapterOptions,
} from "./types";
import { Pool, type PoolClient } from "pg";
import type { StorageAdapter } from "@node-idempotency/storage";
import { DEFAULT_IDEMPOTENCY_OPTS } from "./defaults";

export class PostgresStorageAdapter implements StorageAdapter {
  readonly #pool: Pool;
  readonly #createdPool: boolean;
  readonly #idempotencyOpts: PostgresIdempotencyOpts;
  readonly #tableId: string;
  readonly #defaultTtlMs: number;
  #clearEntitiesTimeout?: NodeJS.Timeout;
  #disconnected = false;

  constructor({ idempotency = {}, ...opts }: PostgresAdapterOptions) {
    if ("pool" in opts) {
      this.#pool = opts.pool;
      this.#createdPool = false;
    } else if ("poolOpts" in opts) {
      this.#pool = new Pool(opts.poolOpts);
      this.#createdPool = true;
    } else {
      throw new Error(
        "Either 'pool' or 'poolOpts' must be provided in PostgresAdapterOptions",
      );
    }

    this.#idempotencyOpts = { ...DEFAULT_IDEMPOTENCY_OPTS, ...idempotency };
    this.#tableId = getTableId(this.#idempotencyOpts);
    this.#defaultTtlMs = this.#idempotencyOpts.defaultTtlMs;

    if (this.#idempotencyOpts.clearExpiredEntitiesIntervalMs) {
      this.#scheduleNextClearExpiredEntries();
    }
  }

  async connect(): Promise<void> {
    const client = await this.#pool.connect();
    try {
      await setup(client, this.#idempotencyOpts);
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    clearTimeout(this.#clearEntitiesTimeout);
    this.#disconnected = true;
    if (!this.#createdPool) {
      return;
    }

    await this.#pool.end();
  }

  async get(key: string): Promise<string | undefined> {
    const {
      rows: [row],
    } = await this.#pool.query(
      `SELECT data FROM ${this.#tableId}
        WHERE key = $1 AND expires_at > NOW()
      `,
      [key],
    );
    return row?.data || undefined;
  }

  async set(
    key: string,
    val: string,
    { ttl = this.#defaultTtlMs }: { ttl?: number | undefined },
  ): Promise<void> {
    await this.#pool.query(
      `INSERT INTO ${this.#tableId} (key, data, expires_at)
       VALUES ($1, $2, NOW() + $3 * INTERVAL '1 millisecond')
       ON CONFLICT (key) DO UPDATE SET
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at`,
      [key, val, ttl],
    );
  }

  async setIfNotExists(
    key: string,
    val: string,
    { ttl = this.#defaultTtlMs }: { ttl?: number },
  ): Promise<boolean> {
    // we'll use a MERGE query to insert the key if it doesn't exist,
    // or update the existing key with the new value and expiration time,
    // if the row is expired
    const { rowCount } = await this.#pool.query(
      `INSERT INTO ${this.#tableId} (key, data, expires_at)
        VALUES ($1, $2, NOW() + $3 * INTERVAL '1 millisecond')
        ON CONFLICT (key) 
        DO UPDATE SET
          data = EXCLUDED.data,
          expires_at = EXCLUDED.expires_at
        WHERE ${this.#tableId}.expires_at < NOW()
        RETURNING key, expires_at;`,
      [key, val, ttl],
    );
    return !!rowCount && rowCount > 0;
  }

  async delete(key: string): Promise<void> {
    await this.#pool.query(`DELETE FROM ${this.#tableId} WHERE key = $1`, [
      key,
    ]);
  }

  async clearExpiredEntries(): Promise<void> {
    await this.#pool.query(
      `SELECT "${this.#idempotencyOpts.idempotencySchemaName}"
        ."remove_expired_idempotency_entries"();`,
    );
  }

  #scheduleNextClearExpiredEntries(): void {
    if (this.#disconnected) {
      return;
    }

    this.#clearEntitiesTimeout = setTimeout(() => {
      this.clearExpiredEntries()
        .catch((err) => {
          console.error("Error clearing expired entries:", err);
        })
        .finally(() => {
          this.#scheduleNextClearExpiredEntries();
        });
    }, this.#idempotencyOpts.clearExpiredEntitiesIntervalMs);
  }
}

async function setup(
  client: PoolClient,
  {
    idempotencyTableName,
    idempotencySchemaName,
    tableType,
  }: PostgresIdempotencyOpts,
): Promise<void> {
  const ddl = SQL_DDL.replaceAll("{{schema_name}}", idempotencySchemaName)
    .replaceAll("{{table_name}}", idempotencyTableName)
    .replaceAll("{{unlogged_type}}", tableType.toUpperCase());
  await client.query(`BEGIN; ${ddl} COMMIT;`);
}

function getTableId({
  idempotencySchemaName,
  idempotencyTableName,
}: PostgresIdempotencyOpts): string {
  return `"${idempotencySchemaName}"."${idempotencyTableName}"`;
}

const SQL_DDL = `
CREATE SCHEMA IF NOT EXISTS "{{schema_name}}";

CREATE {{unlogged_type}} TABLE
IF NOT EXISTS "{{schema_name}}"."{{table_name}}" (
  key VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data TEXT,
  expires_at TIMESTAMPTZ NOT NULl
);

CREATE INDEX IF NOT EXISTS idx_{{table_name}}_expires_at
  ON "{{schema_name}}"."{{table_name}}" (expires_at);

CREATE OR REPLACE FUNCTION "{{schema_name}}".remove_expired_idempotency_entries() RETURNS void AS $$
DELETE FROM "{{schema_name}}"."{{table_name}}"
  WHERE expires_at < NOW();
$$ LANGUAGE sql;
`;
