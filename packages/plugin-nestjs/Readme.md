#### @node-idempotency/nestjs

Nestjs wrapper for Node-Idempotency.
Implements `@node-idempotency/core` as a nestjs interceptor.

##### instal

```bash
npm i @node-idempotency/nestjs
```

##### usage

1. Register the module

```ts
import {NodeIdempotencyModule} from '@node-idempotency/nestjs'

@Module({
  imports: [
    NodeIdempotencyModule.forRootAsync({
      storageAdapter: StorageAdapterEnum.memory,
      ...idempotencyOptions
    }),
  ],
})
```

- `storageAdapter` can either be `memory`, `redis` or an instance of [`Storage`](../storage/Readme.md) interface
- `idempotencyOptions` are the [`IdempotencyOptions`](../core/Readme.md) passed to `@node-idempotency/core/Idempotency`

2. Decorate controllers or handlers

- Decorating controllers

```ts
import { Idempotent } from "@node-idempotency/nestjs";

@Controller()
@Idempotent({ ...idempotencyOptions }) //this will override the options provided while registering the module
export class CounterController {
  counter = 0;
  // all handler are idempotent now
  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Post()
  @HttpCode(201)
  async addNumber(@Body() { number }: { number: number }): Promise<number> {
    this.adCounter += number;
    return this.adCounter;
  }
}
```

- Decorating selected handlers

```ts
import { Idempotent } from "@node-idempotency/nestjs";

@Controller()
export class CounterController {
  counter = 0;

  //only GET is idempotenct POST is not
  @Idempotent({ ...idempotencyOptions }) //this will override the options provided while registering the module
  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Post()
  @HttpCode(201)
  async addNumber(@Body() { number }: { number: number }): Promise<number> {
    this.adCounter += number;
    return this.adCounter;
  }
}
```

Library also exports the interceptor, you can use it like you would use any nestjs interceptors(ex: registering globaly)

```ts
import { NodeIdempotencyInterceptor } from "@node-idempotency/nestjs";
```
