#### @node-idempotency/fastify

A Fastify plugin that makes requests idempotent
Implements `@node-idempotency/core` as fastify plugin.

##### instal

```bash
npm i @node-idempotency/fastify
```

##### usage

```ts
import fastify from "fastify";
import fp from "fastify-plugin";
import {
  idempotencyAsPlugin,
  type IdempotencyPluginOptions,
  StorageAdapterEnum,
} from "@node-idempotency/fastify";

const server = fastify();
server.register(fp<IdempotencyPluginOptions>(idempotencyAsPlugin), {
  storageAdapter: StorageAdapterEnum.memory,
  //...IdempotencyOptions
});

//...your rest of logic
export default server;
```

- `storageAdapter` can either be `memory`, `redis` or an instance of [`Storage`](../storage/Readme.md) interface
- `idempotencyOptions` are the [`IdempotencyOptions`](../core/Readme.md) passed to `@node-idempotency/core/Idempotency`