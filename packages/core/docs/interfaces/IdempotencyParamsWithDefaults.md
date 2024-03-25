[@node-idempotency/core](../README.md) / [Exports](../modules.md) / IdempotencyParamsWithDefaults

# Interface: IdempotencyParamsWithDefaults

## Hierarchy

- [`IdempotencyParams`](IdempotencyParams.md)

  ↳ **`IdempotencyParamsWithDefaults`**

## Table of contents

### Properties

- [body](IdempotencyParamsWithDefaults.md#body)
- [headers](IdempotencyParamsWithDefaults.md#headers)
- [method](IdempotencyParamsWithDefaults.md#method)
- [options](IdempotencyParamsWithDefaults.md#options)
- [path](IdempotencyParamsWithDefaults.md#path)

## Properties

### body

• `Optional` **body**: `Record`\<`string`, `unknown`\>

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[body](IdempotencyParams.md#body)

#### Defined in

[packages/core/src/types.ts:45](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L45)

---

### headers

• **headers**: `Record`\<`string`, `unknown`\>

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[headers](IdempotencyParams.md#headers)

#### Defined in

[packages/core/src/types.ts:43](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L43)

---

### method

• `Optional` **method**: `string`

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[method](IdempotencyParams.md#method)

#### Defined in

[packages/core/src/types.ts:46](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L46)

---

### options

• **options**: `Required`\<`Omit`\<[`IdempotencyOptions`](IdempotencyOptions.md), `"skipRequest"`\>\> & \{ `skipRequest?`: (`req`: [`IdempotencyParamsWithDefaults`](IdempotencyParamsWithDefaults.md)) => `boolean` \| `Promise`\<`boolean`\> }

#### Overrides

[IdempotencyParams](IdempotencyParams.md).[options](IdempotencyParams.md#options)

#### Defined in

[packages/core/src/types.ts:51](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L51)

---

### path

• **path**: `string`

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[path](IdempotencyParams.md#path)

#### Defined in

[packages/core/src/types.ts:44](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L44)
