import type { PostgresIdempotencyOpts } from "./types";

export const DEFAULT_IDEMPOTENCY_OPTS: PostgresIdempotencyOpts = {
  idempotencyTableName: "idempotency",
  idempotencySchemaName: "node_idempotency",
  tableType: "unlogged",
  defaultTtlMs: 15 * 60 * 1000, // 15 minutes
  clearExpiredEntitiesIntervalMs: 15 * 60 * 1000, // 15 minutes
};
