[@node-idempotency/core](../README.md) / [Exports](../modules.md) / IdempotencyError

# Class: IdempotencyError

## Hierarchy

- `Error`

  ↳ **`IdempotencyError`**

## Table of contents

### Constructors

- [constructor](IdempotencyError.md#constructor)

### Properties

- [code](IdempotencyError.md#code)
- [message](IdempotencyError.md#message)
- [meta](IdempotencyError.md#meta)
- [name](IdempotencyError.md#name)
- [stack](IdempotencyError.md#stack)
- [prepareStackTrace](IdempotencyError.md#preparestacktrace)
- [stackTraceLimit](IdempotencyError.md#stacktracelimit)

### Methods

- [captureStackTrace](IdempotencyError.md#capturestacktrace)

## Constructors

### constructor

• **new IdempotencyError**(`message`, `code`, `meta?`): [`IdempotencyError`](IdempotencyError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `code` | [`IdempotencyErrorCodes`](../enums/IdempotencyErrorCodes.md) |
| `meta?` | `Record`\<`string`, `unknown`\> |

#### Returns

[`IdempotencyError`](IdempotencyError.md)

#### Overrides

Error.constructor

#### Defined in

[packages/core/src/error.ts:11](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/error.ts#L11)

## Properties

### code

• **code**: [`IdempotencyErrorCodes`](../enums/IdempotencyErrorCodes.md)

#### Defined in

[packages/core/src/error.ts:9](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/error.ts#L9)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/.pnpm/typescript@5.4.2/node_modules/typescript/lib/lib.es5.d.ts:1077

___

### meta

• `Optional` **meta**: `Record`\<`string`, `unknown`\>

#### Defined in

[packages/core/src/error.ts:10](https://github.com/mahendraHegde/idempotent-http/blob/addd6b0/packages/core/src/error.ts#L10)

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/.pnpm/typescript@5.4.2/node_modules/typescript/lib/lib.es5.d.ts:1076

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/.pnpm/typescript@5.4.2/node_modules/typescript/lib/lib.es5.d.ts:1078

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration

▸ (`err`, `stackTraces`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/.pnpm/@types+node@20.11.28/node_modules/@types/node/globals.d.ts:28

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/.pnpm/@types+node@20.11.28/node_modules/@types/node/globals.d.ts:30

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/.pnpm/@types+node@20.11.28/node_modules/@types/node/globals.d.ts:21
