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
    storageAdapter: StorageAdapterEnum.memory,
  });
  app.use(middleware);
  //register routes here
  app.use(errorHandler); //your custom error handler

  return app;
};
```

- `storageAdapter` can either be `memory`, `redis` or an instance of [`Storage`](../storage/Readme.md) interface
- `idempotencyOptions` are the [`IdempotencyOptions`](../core/Readme.md) passed to `@node-idempotency/core/Idempotency`
