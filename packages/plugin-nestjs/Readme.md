#### @node-idempotency/nestjs

Nestjs wrapper for Node-Idempotency.
Implements `@node-idempotency/core` as a nestjs interceptor.

---

#### Why?

---

Network requests are unpredictable; clients/proxies may send duplicate or concurrent requests due to retries or network issues. To ensure smooth operation, servers must process each request only once. <i>**This package detects and handles duplicates, preventing issues like double charging the customer**</i>. It's:

- <i>Race Condition free: </i> Ensures consistent behavior even during concurrent requests.
- <i>Modular:</i> Easily integrates with your storage or existing implementation, adding a decorator makes the endpoint idempotent.
- <i>Customizable:</i> options to tweak the library as per your need.
- <i>[RFC](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) compliant: </i> Adheres to standards for compatibility with other systems/clients.

---

#### How?
![No Image](../../flow.png)

---

##### instal

```bash
npm i @node-idempotency/nestjs
```

##### usage

1. Register the module

```ts
import { NodeIdempotencyModule } from '@node-idempotency/nestjs';

@Module({
  imports: [
    NodeIdempotencyModule.forRootAsync({
      storage: {
        adapter: StorageAdapterEnum.memory, // or 'redis'
        options: /* adapter options */,
      },
      ...idempotencyOptions, // additional idempotency options
    }),
  ],
})
export class AppModule {}

```

- `storage.adapter` can either be `memory`, `redis` or an instance of [`Storage`](https://github.com/mahendraHegde/node-idempotency/tree/main/packages/storage) interface.
- `storage.options` are options to the storage client, required for `redis`, is client options of [redis client](https://www.npmjs.com/package/redis).
- `idempotencyOptions` are the [`IdempotencyOptions`](https://github.com/mahendraHegde/node-idempotency/blob/main/packages/core/docs/interfaces/IdempotencyOptions.md) passed to `@node-idempotency/core/Idempotency`

2. Decorate controllers or handlers

- Decorating controllers

```ts
import { Controller, Get, Post, HttpCode, Body } from "@nestjs/common";
import { Idempotent } from "@node-idempotency/nestjs";

@Controller()
@Idempotent({ ...idempotencyOptions }) // Override module-level options
export class CounterController {
  counter = 0;

  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Post()
  @HttpCode(201)
  async addNumber(@Body() { number }: { number: number }): Promise<number> {
    this.counter += number;
    return this.counter;
  }
}
```

- Decorating selected handlers

```ts
import { Controller, Get, Post, HttpCode, Body } from "@nestjs/common";
import { Idempotent } from "@node-idempotency/nestjs";

@Controller()
export class CounterController {
  counter = 0;

  @Idempotent({ ...idempotencyOptions }) // Override module-level options
  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Post()
  @HttpCode(201)
  async addNumber(@Body() { number }: { number: number }): Promise<number> {
    this.counter += number;
    return this.counter;
  }
}
```

Library also exports the interceptor, you can use it like you would use any nestjs interceptors(ex: registering globaly)

```ts
import { NodeIdempotencyInterceptor } from "@node-idempotency/nestjs";
```
