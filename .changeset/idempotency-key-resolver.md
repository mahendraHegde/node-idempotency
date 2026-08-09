---
"@node-idempotency/core": minor
"@node-idempotency/express": minor
---

Add a function form to the `idempotencyKey` option. In addition to a header-name string, `idempotencyKey` now accepts a resolver `(req) => string | undefined`, so the key can be derived from the request body, namespaced per tenant, or computed however the app needs (return `undefined` to skip idempotency for that request).

To support this, plugins now pass the raw framework request through on `IdempotencyParams.request` (typed `unknown` to keep the core framework-agnostic), so resolvers — and `skipRequest` — can read framework context such as the authenticated user/tenant. The Express plugin forwards its `Request`.
