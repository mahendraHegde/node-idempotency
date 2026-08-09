# @node-idempotency/core

## 1.1.0

### Minor Changes

- cc69a58: Add a function form to the `idempotencyKey` option. In addition to a header-name string, `idempotencyKey` now accepts a resolver `(req) => string | undefined`, so the key can be derived from the request body, namespaced per tenant, or computed however the app needs (return `undefined` to skip idempotency for that request).

  To support this, plugins now pass the raw framework request through on `IdempotencyParams.request` (typed `unknown` to keep the core framework-agnostic), so resolvers — and `skipRequest` — can read framework context such as the authenticated user/tenant. The Express plugin forwards its `Request`.

## 1.0.11

### Patch Changes

- ea6035c: Add inprogress strategy support
- Updated dependencies [ea6035c]
  - @node-idempotency/storage@1.0.5

## 1.0.10

### Patch Changes

- upgrade dependencies
- Updated dependencies
  - @node-idempotency/storage@1.0.4

## 1.0.9

### Patch Changes

- 7456432: add overrides for braces to fix audit issues
- Updated dependencies [7456432]
  - @node-idempotency/storage@1.0.3

## 1.0.8

### Patch Changes

- 48803ac: add registration with factory method support in nestjs plugin

## 1.0.7

### Patch Changes

- 9200b63: update dependencies to express@4.19.1 vulnerability

## 1.0.6

### Patch Changes

- improve readme

## 1.0.5

### Patch Changes

- ec13f7f: update readme and package.json
- Updated dependencies [ec13f7f]
  - @node-idempotency/storage@1.0.2
