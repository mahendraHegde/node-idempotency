import fastify from "fastify";
import fp from "fastify-plugin";
import testController from "./test.controller";
import {
  idempotencyAsPlugin,
  type IdempotencyPluginOptions,
  StorageAdapterEnum,
} from "../../../../src/index";

const server = fastify();
void server.register(fp<IdempotencyPluginOptions>(idempotencyAsPlugin), {
  storageAdapter: StorageAdapterEnum.memory,
  enforceIdempotency: true,
  keyMaxLength: 3,
});
testController(server);

export default server;
