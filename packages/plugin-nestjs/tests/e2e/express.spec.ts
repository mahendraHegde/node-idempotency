import "jest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import * as request from "supertest";
import { ExpressModule } from "./modules/express/express.module";
import { NestFactory } from "@nestjs/core";

describe("Express Application", () => {
  let server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ExpressModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    server = app.getHttpServer();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it("should return a different value after the TTL is elapsed", async () => {
    await request(server).get("/").expect(200, "0");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await request(server).get("/").expect(200, "1");
  });

  afterEach(async () => {
    await app.close();
  });
});
