[@node-idempotency/core](../README.md) / [Exports](../modules.md) / IdempotencyOptions

# Interface: IdempotencyOptions

## Table of contents

### Properties

- [cacheKeyPrefix](IdempotencyOptions.md#cachekeyprefix)
- [cacheTTLMS](IdempotencyOptions.md#cachettlms)
- [enforceIdempotency](IdempotencyOptions.md#enforceidempotency)
- [idempotencyKey](IdempotencyOptions.md#idempotencykey)
- [inProgressStrategy](IdempotencyOptions.md#inprogressstrategy)
- [keyMaxLength](IdempotencyOptions.md#keymaxlength)
- [skipRequest](IdempotencyOptions.md#skiprequest)

## Properties

### cacheKeyPrefix

• `Optional` **cacheKeyPrefix**: `string`

**`Default Value`**

`node-idempotency`

prefix/namespace for cache key

#### Defined in

[packages/core/src/types.ts:20](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L20)

---

### cacheTTLMS

• `Optional` **cacheTTLMS**: `number`

**`Default Value`**

`1000 * 60 * 60 * 24(1 day)`

ttl for idempotency

#### Defined in

[packages/core/src/types.ts:26](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L26)

---

### enforceIdempotency

• `Optional` **enforceIdempotency**: `boolean`

**`Default Value`**

`false`

if set to `true` requests without idempotency key header will be rejected

#### Defined in

[packages/core/src/types.ts:32](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L32)

---

### idempotencyKey

• `Optional` **idempotencyKey**: `string`

**`Default Value`**

`idempotency-key`

specifies the header key to look for to get idempotency key
case insensitive.

#### Defined in

[packages/core/src/types.ts:8](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L8)

---

### inProgressStrategy

• `Optional` **inProgressStrategy**: `Object`

Strategy for handling in-progress requests for the same Idempotency-Key.

**`Default Value`**

```ts
{ wait: false, pollingIntervalMs: 100, maxWaitMs: 5000 }

- wait: If true, when a request is in progress for the same Idempotency-Key,
        this request will wait for the in-progress request to complete and return
        the cached response, instead of throwing an error.
- pollingIntervalMs: How often (ms) to poll for completion.
- maxWaitMs: Maximum time (ms) to wait before timing out.
```

#### Type declaration

| Name                 | Type      |
| :------------------- | :-------- |
| `maxWaitMs?`         | `number`  |
| `pollingIntervalMs?` | `number`  |
| `wait?`              | `boolean` |

#### Defined in

[packages/core/src/types.ts:44](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L44)

---

### keyMaxLength

• `Optional` **keyMaxLength**: `number`

**`Default Value`**

`256`

restricts max length of idempotency key

#### Defined in

[packages/core/src/types.ts:14](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L14)

---

### skipRequest

• `Optional` **skipRequest**: (`req`: [`IdempotencyParamsWithDefaults`](IdempotencyParamsWithDefaults.md)) => `boolean` \| `Promise`\<`boolean`\>

**`Default Value`**

`undefined`

custom way to specify which request to skip and which to accept

#### Type declaration

▸ (`req`): `boolean` \| `Promise`\<`boolean`\>

##### Parameters

| Name  | Type                                                                |
| :---- | :------------------------------------------------------------------ |
| `req` | [`IdempotencyParamsWithDefaults`](IdempotencyParamsWithDefaults.md) |

##### Returns

`boolean` \| `Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:55](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L55)
