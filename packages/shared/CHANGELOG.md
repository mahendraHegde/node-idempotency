# @node-idempotency/shared

## 1.0.8

### Patch Changes

- cc69a58: Fix `@node-idempotency/shared` publishing with an empty package (no `dist/`). `dist` is gitignored and `shared` was missing the `files: ["dist/"]` allow-list that every other package has, so npm fell back to `.gitignore` and dropped the compiled output. This made `require("@node-idempotency/express")` throw `MODULE_NOT_FOUND` for `@node-idempotency/shared/dist/index.js` at load.

  Fix `@node-idempotency/express` swallowing non-`IdempotencyError` failures in the success handler. A storage/backend error while reserving or reading the cache was caught but neither responded to nor passed to `next()`, leaving the request hanging until it timed out. Such errors are now propagated via `next(err)`.

- Updated dependencies [cc69a58]
  - @node-idempotency/core@1.1.0

## 1.0.7

### Patch Changes

- ea6035c: Add inprogress strategy support
- Updated dependencies [ea6035c]
  - @node-idempotency/storage-adapter-memory@1.0.5
  - @node-idempotency/storage-adapter-redis@1.0.5
  - @node-idempotency/storage@1.0.5
  - @node-idempotency/core@1.0.11

## 1.0.6

### Patch Changes

- upgrade dependencies
- Updated dependencies
  - @node-idempotency/core@1.0.10
  - @node-idempotency/storage@1.0.4
  - @node-idempotency/storage-adapter-memory@1.0.4
  - @node-idempotency/storage-adapter-redis@1.0.4

## 1.0.5

### Patch Changes

- 7456432: add overrides for braces to fix audit issues
- Updated dependencies [7456432]
  - @node-idempotency/core@1.0.9
  - @node-idempotency/storage@1.0.3
  - @node-idempotency/storage-adapter-memory@1.0.3
  - @node-idempotency/storage-adapter-redis@1.0.3

## 1.0.4

### Patch Changes

- 48803ac: add registration with factory method support in nestjs plugin
- Updated dependencies [48803ac]
  - @node-idempotency/core@1.0.8

## 1.0.3

### Patch Changes

- 9200b63: update dependencies to express@4.19.1 vulnerability
- Updated dependencies [9200b63]
  - @node-idempotency/storage-adapter-memory@1.0.2
  - @node-idempotency/storage-adapter-redis@1.0.2
  - @node-idempotency/core@1.0.7

## 1.0.2

### Patch Changes

- Updated dependencies
  - @node-idempotency/core@1.0.6

## 1.0.1

### Patch Changes

- ec13f7f: update readme and package.json
- Updated dependencies [ec13f7f]
  - @node-idempotency/storage-adapter-memory@1.0.1
  - @node-idempotency/storage-adapter-redis@1.0.1
  - @node-idempotency/storage@1.0.2
  - @node-idempotency/core@1.0.5
