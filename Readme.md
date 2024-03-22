<h3> Node-Idempotency </h3>
<i>Make requests idempotent on nodejs.</i>


#### @node-idempotency/core
Core package that, makes requests idempotent and powers
- [`@node-idempotency/nestjs`](packages/plugin-nestjs/Readme.md) - Plug and Play `nestjs` wrapper for `@node-idempotency/core`

- [`@node-idempotency/express`](packages/plugin-express/Readme.md) - Plug and Play `express` middleware for `@node-idempotency/core`

- [`@node-idempotency/fastify`](packages/plugin-fastify/Readme.md) - Plug and Play `fastify` plugin for `@node-idempotency/core`

if above packages dont meet your needs, you can utilise the core package directly to tweek it as per your needs.

##### install
```bash
npm i @node-idempotency/core
```
##### usage

The flow for idempotency is simple, you call the `onRequest` handler, when you receieve the request from clients before it reaches your business logic/controller.
`onRequest` handler validates request for conflicts, figerprint missmatch, no idempotency-key(when idempotency is enforced) and gives back the response if the key is already seen, you typically give back the "cached" response to the client.
if its a new request, it marks the request as progress generates fingerprint using `body` (so that it can validate conflicts for duplicate requests and figure out fingerprint missmatch), and returns undefined, you are responsible here to pass the request to your controller/business logic.

`onResponse` handler is called by you when your business logic completes for the first time, so that the response can be stored and the request can be marked as complete.


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
  // its a duplicate, dont process again, return previous response
  // ex: res.status(response.additional.status).send(response.body)
} catch (err) {
  //handle idempotency error here(conflict, in-progress, figerprint missmatch etc).
  //check api details for defined error codes.
}

// make sure to intercept the response so that the cycle is complete
  const response = await idempotency.onResponse(
    {
    method: "POST",
    headers: { "idempotency-key": "123" },
    body: { pay: 100 },
    path: "/charge",
    options: { ...idempotencyOptions } //use options here override idempotencyOptions per request level
  },
  {
    body:{ charge:"success" } //or error: your_error,
    additional:{ status: 201 }
  });

```
check details about the api [here](./packages/core/docs/classes/Idempotency.md)


<br/>
<hr/>

Other packages in the monorepo are, click on the links to read detailed uses of each repo.

1. [`@node-idempotency/storage`](packages/storage/Readme.md) - `Storage` adapater interface that dictate the storage interface for the `core`.

2. [`@node-idempotency/storage-adapter-memory`](packages/storage-adapter-memory/Readme.md) - `In-memory` implementation of `Storage` interface.

3. [`@node-idempotency/storage-adapter-redis`](packages/storage-adapter-redis/Readme.md) - `Redis` implementation of `Storage` interface.(WIP)

---

#### Contributing

Read more [here](./Contributing.md)
