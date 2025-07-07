import {
  type PostgresIdempotencyOpts,
  type PostgresAdapterOptions,
} from "./types";
import { Pool, type PoolClient } from "pg";
import type { StorageAdapter } from "@node-idempotency/storage";

export class PostgresStorageAdapter implements StorageAdapter {
  readonly #pool: Pool;
  readonly #createdPool: boolean;
  readonly #idempotencyOpts: PostgresIdempotencyOpts;
  readonly #tableId: string;
  readonly #defaultTtl: number;

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

    this.#idempotencyOpts = idempotency;
    this.#tableId = getTableId(idempotency);
    this.#defaultTtl = idempotency.defaultTtl ?? 15 * 60;
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
    if (!this.#createdPool) {
      return;
    }

    await this.#pool.end();
  }

  async get(key: string): Promise<string | undefined> {
    const {
      rows: [row],
    } = await this.#pool.query(
      `SELECT data FROM ${this.#tableId} WHERE key = $1`,
      [key],
    );
    return row?.data || undefined;
  }

  async set(
    key: string,
    val: string,
    { ttl = this.#defaultTtl }: { ttl?: number | undefined },
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl * 1000);
    await this.#pool.query(
      `INSERT INTO ${this.#tableId} (key, data, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at`,
      [key, val, expiresAt],
    );
  }

  async setIfNotExists(
    key: string,
    val: string,
    { ttl = this.#defaultTtl }: { ttl?: number },
  ): Promise<boolean> {
    const { rowCount } = await this.#pool.query(
      `INSERT INTO ${this.#tableId} (key, data, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING
         RETURNING key
        `,
      [key, val, ttl ? new Date(Date.now() + ttl * 1000) : null],
    );
    return !!rowCount && rowCount > 0;
  }

  async delete(key: string): Promise<void> {
    await this.#pool.query(`DELETE FROM ${this.#tableId} WHERE key = $1`, [
      key,
    ]);
  }
}

async function setup(
  client: PoolClient,
  {
    idempotencyTableName = "idempotency",
    idempotencySchemaName = "node_idempotency",
    tableType = "unlogged",
  }: PostgresIdempotencyOpts,
): Promise<void> {
  const ddl = SQL_DDL.replaceAll("{{schema_name}}", idempotencySchemaName)
    .replaceAll("{{table_name}}", idempotencyTableName)
    .replaceAll("{{unlogged_type}}", tableType.toUpperCase());
  await client.query(`BEGIN; ${ddl} COMMIT;`);
}

function getTableId({
  idempotencyTableName = "idempotency",
  idempotencySchemaName = "node-idempotency",
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
BEGIN
  DELETE FROM "{{schema_name}}"."{{table_name}}"
  WHERE expires_at < NOW();
END;
$$ LANGUAGE sql;
`;
