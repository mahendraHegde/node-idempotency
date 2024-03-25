[@node-idempotency/core](../README.md) / [Exports](../modules.md) / IdempotencyResponse

# Interface: IdempotencyResponse\<BodyType, ErrorType\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `BodyType` | `unknown` |
| `ErrorType` | `unknown` |

## Table of contents

### Properties

- [additional](IdempotencyResponse.md#additional)
- [body](IdempotencyResponse.md#body)
- [error](IdempotencyResponse.md#error)

## Properties

### additional

• `Optional` **additional**: `Record`\<`string`, `unknown`\>

#### Defined in

[packages/core/src/types.ts:76](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L76)

___

### body

• `Optional` **body**: `BodyType`

#### Defined in

[packages/core/src/types.ts:75](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L75)

___

### error

• `Optional` **error**: `ErrorType`

#### Defined in

[packages/core/src/types.ts:77](https://github.com/mahendraHegde/idempotent-http/blob/865df0d/packages/core/src/types.ts#L77)
