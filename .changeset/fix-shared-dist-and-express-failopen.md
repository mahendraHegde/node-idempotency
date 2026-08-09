---
"@node-idempotency/shared": patch
"@node-idempotency/express": patch
---

Fix `@node-idempotency/shared` publishing with an empty package (no `dist/`). `dist` is gitignored and `shared` was missing the `files: ["dist/"]` allow-list that every other package has, so npm fell back to `.gitignore` and dropped the compiled output. This made `require("@node-idempotency/express")` throw `MODULE_NOT_FOUND` for `@node-idempotency/shared/dist/index.js` at load.

Fix `@node-idempotency/express` swallowing non-`IdempotencyError` failures in the success handler. A storage/backend error while reserving or reading the cache was caught but neither responded to nor passed to `next()`, leaving the request hanging until it timed out. Such errors are now propagated via `next(err)`.
