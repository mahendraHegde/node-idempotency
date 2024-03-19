// eslint-disable @typescript-eslint/no-unsafe-argument
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import * as request from "supertest";
import { TestModule } from "./modules/test/test.module";
import { IDEMPOTENCY_REPLAYED_HEADER } from "../../src/constants";
import { type Server } from "net";
const idempotencyKey = "Idempotency-Key";

describe("Node-Idempotency", () => {
  ["fastify", "express"].forEach((adapter) => {
    describe(`when ${adapter}`, () => {
      let server: Server;
      let app: INestApplication;

      beforeEach(async () => {
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
      afterEach(async () => {
        await app.close();
      });

      it("should return a cached response when key is reused", async () => {
        const res1 = await request(server)
          .get("/")
          .set({ [idempotencyKey]: "1" })
          .expect(200, "0");
        const res2 = await request(server)
          .get("/")
          .set({ [idempotencyKey]: "1" })
          .expect(200, "0");
        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()]).toEqual(
          "true",
        );
      });

      it("should return a cached response when key is reused with request body", async () => {
        const res1 = await request(server)
          .post("/add")
          .set({ [idempotencyKey]: "4" })
          .send({ number: 2 })
          .expect(201, "2");

        const res2 = await request(server)
          .post("/add")
          .set({ [idempotencyKey]: "4" })
          .send({ number: 2 })
          .expect(201, "2");

        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()]).toEqual(
          "true",
        );
      });

      it("should return a cached error when key is reused", async () => {
        const res1 = await request(server)
          .get("/error")
          .set({ [idempotencyKey]: "5" })
          .expect(400);

        const res2 = await request(server)
          .get("/error")
          .set({ [idempotencyKey]: "5" })
          .expect(400);

        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()]).toEqual(
          "true",
        );
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

      it("should return error when different body is used for the same key", async () => {
        const res1 = await request(server)
          .post("/add")
          .set({ [idempotencyKey]: "3" })
          .send({ number: 1 })
          .expect(201, "1");

        const res2 = await request(server)
          .post("/add")
          .set({ [idempotencyKey]: "3" })
          .send({ number: 2 })
          .expect(422);
        expect(JSON.parse(res2.text)).toEqual({
          message: "Idempotency-Key is already used",
          statusCode: 422,
        });
        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(
          res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
      });
    });
  });
});
