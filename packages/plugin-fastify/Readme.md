#### @node-idempotency/fastify

A Fastify plugin that makes requests idempotent
Implements `@node-idempotency/core` as fastify plugin.

---

#### Why?

---

Network requests are unpredictable; clients/proxies may send duplicate or concurrent requests due to retries or network issues. To ensure smooth operation, servers must process each request only once. <i>**This package detects and handles duplicates, preventing issues like double charging the customer**</i>. It's:

- <i>Race Condition free: </i> Ensures consistent behavior even during concurrent requests.
- <i>Modular:</i> Easily integrates with your storage or existing implementation.(as simple as registering a plugin to fastify)
- <i>Customizable:</i> options to tweak the library as per your need.
- <i>[RFC](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) compliant: </i> Adheres to standards for compatibility with other systems/clients.

---

#### How?

## ![No Image](https://raw.githubusercontent.com/mahendraHegde/node-idempotency/main/flow.png)

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
