[@node-idempotency/core](../README.md) / [Exports](../modules.md) / Idempotency

# Class: Idempotency

## Table of contents

### Constructors

- [constructor](Idempotency.md#constructor)

### Properties

- [options](Idempotency.md#options)

### Methods

- [onRequest](Idempotency.md#onrequest)
- [onResponse](Idempotency.md#onresponse)

## Constructors

### constructor

• **new Idempotency**(`storage`, `options?`): [`Idempotency`](Idempotency.md)

#### Parameters

| Name       | Type                                                        |
| :--------- | :---------------------------------------------------------- |
| `storage`  | `StorageAdapter`                                            |
| `options?` | [`IdempotencyOptions`](../interfaces/IdempotencyOptions.md) |

#### Returns

[`Idempotency`](Idempotency.md)

#### Defined in

[packages/core/src/idempotency.ts:20](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/idempotency.ts#L20)

## Properties

### options

• **options**: `Required`\<`Omit`\<[`IdempotencyOptions`](../interfaces/IdempotencyOptions.md), `"skipRequest"`\>\> & \{ `skipRequest?`: (`req`: [`IdempotencyParamsWithDefaults`](../interfaces/IdempotencyParamsWithDefaults.md)) => `boolean` \| `Promise`\<`boolean`\> }

#### Defined in

[packages/core/src/idempotency.ts:19](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/idempotency.ts#L19)

## Methods

### onRequest

▸ **onRequest**\<`BodyType`, `ErrorType`\>(`req`): `Promise`\<`undefined` \| [`IdempotencyResponse`](../interfaces/IdempotencyResponse.md)\<`BodyType`, `ErrorType`\>\>

#### Type parameters

| Name        |
| :---------- |
| `BodyType`  |
| `ErrorType` |

#### Parameters

| Name  | Type                                                      |
| :---- | :-------------------------------------------------------- |
| `req` | [`IdempotencyParams`](../interfaces/IdempotencyParams.md) |

#### Returns

`Promise`\<`undefined` \| [`IdempotencyResponse`](../interfaces/IdempotencyResponse.md)\<`BodyType`, `ErrorType`\>\>

**`Throws`**

[IdempotencyError](IdempotencyError.md) if `request is already in progress or invalid`

to be called on receiving the request, if the key is already cached, returns or throws based on the status, if returns nothing

#### Defined in

[packages/core/src/idempotency.ts:122](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/idempotency.ts#L122)

---

### onResponse

▸ **onResponse**\<`BodyType`, `ErrorType`\>(`req`, `res`): `Promise`\<`void`\>

to be called on receiving response/error, it cached the response/error and updates status to complete.
subsequent requests can use cached response.

#### Type parameters

| Name        |
| :---------- |
| `BodyType`  |
| `ErrorType` |

#### Parameters

| Name  | Type                                                                                     |
| :---- | :--------------------------------------------------------------------------------------- |
| `req` | [`IdempotencyParams`](../interfaces/IdempotencyParams.md)                                |
| `res` | [`IdempotencyResponse`](../interfaces/IdempotencyResponse.md)\<`BodyType`, `ErrorType`\> |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/idempotency.ts:201](https://github.com/mahendraHegde/idempotent-http/blob/7f08fdae1302a799af29559614eee1e2c94cb6f7/packages/core/src/idempotency.ts#L201)
