import { Controller, Get, Res, UseInterceptors } from '@nestjs/common'
import { Idempotent } from '../../../../src/index'

// import { NodeIdempotencyInterceptor } from '../../../../src/interceptors/index';

@Controller()
@Idempotent({ allowedMethods: ['get'] })
export class ExpressController {
  counter = 0
  // constructor(private readonly i:NodeIdempotencyInterceptor) {
  //   console.log(i)
  // }

  @Get()
  getNumber (): number {
    return this.counter++
  }
}
