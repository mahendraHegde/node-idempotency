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
  storage:{
    adapter: StorageAdapterEnum.memory
    options: ...adapterOptions
  },
  //...IdempotencyOptions
});

//...your rest of logic
export default server;
```

- `storage.adapter` can either be `memory`, `redis` or an instance of [`Storage`](https://github.com/mahendraHegde/node-idempotency/tree/main/packages/storage) interface.
- `storage.options` are options to the storage client, required for `redis`, is client options of [redis client](https://www.npmjs.com/package/redis).
- `idempotencyOptions` are the [`IdempotencyOptions`](https://github.com/mahendraHegde/node-idempotency/blob/main/packages/core/docs/interfaces/IdempotencyOptions.md) passed to `@node-idempotency/core/Idempotency`
