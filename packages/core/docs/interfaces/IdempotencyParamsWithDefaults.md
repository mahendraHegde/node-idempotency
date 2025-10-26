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

[packages/core/src/types.ts:63](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L63)

---

### headers

• **headers**: `Record`\<`string`, `unknown`\>

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[headers](IdempotencyParams.md#headers)

#### Defined in

[packages/core/src/types.ts:61](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L61)

---

### method

• `Optional` **method**: `string`

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[method](IdempotencyParams.md#method)

#### Defined in

[packages/core/src/types.ts:64](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L64)

---

### options

• **options**: `Required`\<`Omit`\<[`IdempotencyOptions`](IdempotencyOptions.md), `"skipRequest"`\>\> & \{ `skipRequest?`: (`req`: [`IdempotencyParamsWithDefaults`](IdempotencyParamsWithDefaults.md)) => `boolean` \| `Promise`\<`boolean`\> }

#### Overrides

[IdempotencyParams](IdempotencyParams.md).[options](IdempotencyParams.md#options)

#### Defined in

[packages/core/src/types.ts:69](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L69)

---

### path

• **path**: `string`

#### Inherited from

[IdempotencyParams](IdempotencyParams.md).[path](IdempotencyParams.md#path)

#### Defined in

[packages/core/src/types.ts:62](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/types.ts#L62)
