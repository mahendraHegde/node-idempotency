import "jest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import * as request from "supertest";
import { TestModule } from "./modules/test/test.module";
const idempotencyKey = "Idempotency-Key";

describe("Node-Idempotency", () => {
  ["fastify", "express"].map((adapter) => {
    describe(`when ${adapter}`, () => {
      let server;
      let app: INestApplication;

      beforeAll(async () => {
        const module = await Test.createTestingModule({
          imports: [TestModule],
        }).compile();
        if (adapter === "fastify") {
          app = module.createNestApplication(new FastifyAdapter());
        } else {
          app = module.createNestApplication();
        }
        server = app.getHttpServer();
        await app.init();
        if (adapter === "fastify") {
          await app.getHttpAdapter().getInstance().ready();
        }
      });

      it("should return a cached response when key is reused", async () => {
        await request(server)
          .get("/")
          .set({ [idempotencyKey]: "1" })
          .expect(200, "0");
        await new Promise((resolve) => setTimeout(resolve, 500));
        await request(server)
          .get("/")
          .set({ [idempotencyKey]: "1" })
          .expect(200, "0");
      });

      it("should return a conflict when parallel requests are made", async () => {
        const [res1, res2] = await Promise.all([
          request(server)
            .get("/slow")
            .set({ [idempotencyKey]: "2" })
            .then((res) => res)
            .catch((err) => err),
          request(server)
            .get("/slow")
            .set({ [idempotencyKey]: "2" })
            .then((res) => res)
            .catch((err) => err),
        ]);

        const success = res1.status === 200 ? res1.status : res2.status;
        const conflict = res1.status !== 200 ? res1.status : res2.status;
        const successBody = res1.status === 200 ? res1.text : res2.text;
        const conflictBody = res1.status !== 200 ? res1.body : res2.body;
        expect(success).not.toBe(conflict);
        expect(success).toBe(200);
        expect(conflict).toBe(409);
        expect(successBody).toEqual("0");
        expect(conflictBody).toEqual({
          message: "A request is outstanding for this Idempotency-Key",
          statusCode: 409,
        });
      });

      afterAll(async () => {
        await app.close();
      });
    });
  });
});
