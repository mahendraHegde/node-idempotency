<center> <h2> Node-Idempotency </h2></center>
<center> <i>Make requests idempotent on nodejs</i> </center>

<br/>

This is a monorepo that contains, click on the links to read detailed uses of each repo.

1. `@node-idempotency/core` - Reusable core implementation of idempotency.
2. `@node-idempotency/storage` - `Storage` adapater interface that dictate the storage interface for the `core`.
3. `@node-idempotency/storage-adapter-memory` - `In-memory` implementation of `Storage` interface.
4. `@node-idempotency/storage-adapter-redis` - `Redis` implementation of `Storage` interface.(WIP)
5. [`@node-idempotency/nestjs`](packages/plugin-nestjs/Readme.md) - Plug and Play `nestjs` wrapper for `@node-idempotency/core`
6. `@node-idempotency/express` - Plug and Play `express` middleware for `@node-idempotency/core`
7. `@node-idempotency/fastify` - Plug and Play `fastify` wrapper for `@node-idempotency/core`

---

#### Contributing

Read more [here](./Contributing.md)
