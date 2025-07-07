import { type Pool, type PoolConfig } from "pg";

export interface PostgresIdempotencyOpts {
  /**
   * The name of the idempotency table.
   * This table will be created in the specified schema.
   * @default "idempotency"
   */
  idempotencyTableName: string;
  /**
   * The name of the schema where the idempotency table will be created.
   * If the schema does not exist, it will be created.
   * @default "node-idempotency"
   */
  idempotencySchemaName: string;
  /**
   * Whether the table is unlogged or logged.
   * Unlogged tables produce faster, cheaper writes but
   * do not persist data in the event of a crash.
   * Logged tables are slower but ensure data durability.
   * Read more about it here:
   * https://www.crunchydata.com/blog/postgresl-unlogged-tables
   *
   * @default "unlogged"
   */
  tableType: "unlogged" | "logged";
  /**
   * The default TTL for idempotency keys in ms.
   * @default 15 * 60 * 1000 (15 minutes)
   */
  defaultTtlMs: number;
  /**
   * Interval in ms to clear expired entities.
   * If not specified, the adapter will not clear expired entities.
   * @default 15 * 60 * 1000
   */
  clearExpiredEntitiesIntervalMs: number;
}

export type PostgresAdapterOptions = {
  idempotency?: Partial<PostgresIdempotencyOpts>;
} & (
  | {
      /**
       * Specify the connection pool options,
       * to create a new Pool instance.
       */
      poolOpts: PoolConfig;
    }
  | {
      /**
       * Use an existing Pool instance. If this is specified,
       * you are responsible for managing the lifecycle of the Pool.
       * The adapter will not create or destroy the Pool.
       */
      pool: Pool;
    }
);
