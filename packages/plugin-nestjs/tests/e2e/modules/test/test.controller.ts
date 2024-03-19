import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
} from "@nestjs/common";
import { Idempotent } from "../../../../src/index";

@Controller()
@Idempotent({ keyMaxLength: 100 })
export class TestController {
  counter = 0;
  slowCounter = 0;
  adCounter = 0;

  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Get("/slow")
  async getSlowNumber(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.slowCounter++;
  }

  @Get("/error")
  async getError(): Promise<void> {
    throw new BadRequestException();
  }

  @Post("/add")
  @HttpCode(201)
  async addNumber(@Body() { number }: { number: number }): Promise<number> {
    this.adCounter += number;
    return this.adCounter;
  }
}
