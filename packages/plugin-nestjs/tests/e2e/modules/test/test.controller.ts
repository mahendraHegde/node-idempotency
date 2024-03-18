import { Controller, Get, Res, UseInterceptors } from "@nestjs/common";
import { Idempotent } from "../../../../src/index";

@Controller()
@Idempotent({ allowedMethods: ["get"] })
export class ExpressController {
  counter = 0;
  slowCounter = 0;

  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Get("/slow")
  async getSlowNumber(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.slowCounter++;
  }
}
