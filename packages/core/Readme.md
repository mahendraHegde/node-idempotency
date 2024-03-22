#### @node-idempotency/core

Core package that, makes requests idempotent and powers
- [`@node-idempotency/nestjs`](packages/plugin-nestjs/Readme.md) - Plug and Play `nestjs` wrapper for `@node-idempotency/core`

- [`@node-idempotency/express`](packages/plugin-express/Readme.md) - Plug and Play `express` middleware for `@node-idempotency/core`

- [`@node-idempotency/fastify`](packages/plugin-fastify/Readme.md) - Plug and Play `fastify` plugin for `@node-idempotency/core`

if above packages dont meet your needs, you can utilise the core package directly to meet your needs.

##### install
```bash
npm i @node-idempotency/core
```
##### usage
```ts
import { Idempotency } from '@node-idempotency/core'
import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory"; //or any other storage adapter of your choice which meets @node-idempotency/storage interface

const idempotency = new Idempotency(new MemoryStorageAdapter(), {...idempotencyOptions});

// on receiving the request call `onRequest`
// it validate the request based on `idempotencyOptions` and throws eror if the request is concurrent, sends different body for the same key or doesnt sent idempotency-key when idempotency is enforced
try {
  const response = await idempotency.onRequest({
    method: "POST",
    headers: { "idempotency-key": "123" },
    body: { pay: 100 },
    path: "/charge",
    options: { ...idempotencyOptions } //use options here override idempotencyOptions per request level
  });

  if (!response) {
    //request is new, allow it to proceed
    return;
  }
  //its a duplicate, dont process again, return previous response
  // ex: res.status(response.additional.status).send(response.body)
} catch (err) {
  //handle idempotency error here(conflict, in-progress, figerprint missmatch etc).
  //check api details for defined error codes.
}

```
check details about the api [here](./docs/classes/Idempotency.md)