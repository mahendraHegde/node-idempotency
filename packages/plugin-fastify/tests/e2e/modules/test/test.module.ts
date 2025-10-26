import fastify, { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import testController from "./test.controller";
import {
  idempotencyAsPlugin,
  type IdempotencyPluginOptions,
  StorageAdapterEnum,
} from "../../../../src/index";

const createServer = (options: IdempotencyPluginOptions): FastifyInstance => {
  const server = fastify();
  void server.register(
    fp<IdempotencyPluginOptions>(idempotencyAsPlugin),
    options,
  );
  testController(server);
  return server;
};

export const serverNoWait = createServer({
  storage: { adapter: StorageAdapterEnum.memory },
  enforceIdempotency: true,
  keyMaxLength: 3,
});

export const serverWait = createServer({
  storage: { adapter: StorageAdapterEnum.memory },
  enforceIdempotency: true,
  keyMaxLength: 3,
  inProgressStrategy: {
    wait: true,
    pollingIntervalMs: 50,
    maxWaitMs: 10000,
  },
});

export default serverNoWait;
