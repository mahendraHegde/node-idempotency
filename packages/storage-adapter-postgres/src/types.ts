import { type Pool, type PoolConfig } from "pg";

export interface PostgresIdempotencyOpts {
  /**
   * @default "idempotency"
   */
  idempotencyTableName?: string;
  /**
   * @default "node-idempotency"
   */
  idempotencySchemaName?: string;

  tableType?: "unlogged" | "logged";

  /**
   * The default TTL for idempotency keys in seconds.
   * @default 15 * 60 (15 minutes)
   */
  defaultTtl?: number;
}

export type PostgresAdapterOptions = {
  idempotency?: PostgresIdempotencyOpts;
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
