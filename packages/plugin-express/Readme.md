#### @node-idempotency/express

A Fastify plugin that makes requests idempotent
Implements `@node-idempotency/core` as fastify plugin.

##### instal

```bash
npm i @node-idempotency/express
```

##### usage

```ts
import * as express from "express";

//server.ts
export default async (): Promise<express.Application> => {
  const app = express();
  const middleware = await idempotencyAsMiddleware({
    storage:{
      adapter: StorageAdapterEnum.memory
      options: ...adapterOptions
    },
  ...idempotencyOptions
  });
  app.use(middleware);
  //register routes here
  app.use(errorHandler); //your custom error handler

  return app;
};
```

- `storage.adapter` can either be `memory`, `redis` or an instance of [`Storage`](https://github.com/mahendraHegde/node-idempotency/tree/main/packages/storage) interface.
- `storage.options` are options to the storage client, required for `redis`, is client options of [redis client](https://www.npmjs.com/package/redis).
- `idempotencyOptions` are the [`IdempotencyOptions`](https://github.com/mahendraHegde/node-idempotency/blob/main/packages/core/docs/interfaces/IdempotencyOptions.md) passed to `@node-idempotency/core/Idempotency`
