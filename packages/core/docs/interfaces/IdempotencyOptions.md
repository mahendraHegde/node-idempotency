[@node-idempotency/core](../README.md) / [Exports](../modules.md) / IdempotencyOptions

# Interface: IdempotencyOptions

## Table of contents

### Properties

- [cacheKeyPrefix](IdempotencyOptions.md#cachekeyprefix)
- [cacheTTLMS](IdempotencyOptions.md#cachettlms)
- [enforceIdempotency](IdempotencyOptions.md#enforceidempotency)
- [idempotencyKey](IdempotencyOptions.md#idempotencykey)
- [keyMaxLength](IdempotencyOptions.md#keymaxlength)

## Properties

### cacheKeyPrefix

• `Optional` **cacheKeyPrefix**: `string`

**`Default Value`**

`node-idempotency`

prefix/namespace for cache key

#### Defined in

[packages/core/src/types.ts:20](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/types.ts#L20)

___

### cacheTTLMS

• `Optional` **cacheTTLMS**: `number`

**`Default Value`**

`1000 * 60 * 60 * 24(1 day)`

ttl for idempotency

#### Defined in

[packages/core/src/types.ts:26](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/types.ts#L26)

___

### enforceIdempotency

• `Optional` **enforceIdempotency**: `boolean`

**`Default Value`**

`false`

if set to `true` requests without idempotency key header will be rejected

#### Defined in

[packages/core/src/types.ts:32](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/types.ts#L32)

___

### idempotencyKey

• `Optional` **idempotencyKey**: `string`

**`Default Value`**

`idempotency-key`

specifies the header key to look for to get idempotency key
case insensitive

#### Defined in

[packages/core/src/types.ts:8](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/types.ts#L8)

___

### keyMaxLength

• `Optional` **keyMaxLength**: `number`

**`Default Value`**

`256`

restricts max length of idempotency key

#### Defined in

[packages/core/src/types.ts:14](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/types.ts#L14)
