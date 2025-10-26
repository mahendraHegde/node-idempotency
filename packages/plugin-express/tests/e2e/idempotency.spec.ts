import * as request from "supertest";
import type * as express from "express";
import { createAppNoWait, createAppWait } from "./modules/test/test.module";
import { HTTPHeaderEnum } from "@node-idempotency/shared";
const idempotencyKey = "Idempotency-Key";
// const server = fastifyInstance as unknown as Server
const IDEMPOTENCY_REPLAYED_HEADER = HTTPHeaderEnum.idempotentReplayed;

const configs = [
  { name: "without wait strategy", createApp: createAppNoWait },
  { name: "with wait strategy", createApp: createAppWait },
];

describe("Node-Idempotency", () => {
  configs.forEach(({ name, createApp }) => {
    describe(name, () => {
      let app: express.Application;
      beforeAll(async () => {
        app = await createApp();
      });

      it("should return a cached response when key is reused", async () => {
        const res1 = await request(app)
          .get("/")
          .set({ [idempotencyKey]: "1" })
          .expect(200, "1");

        const res2 = await request(app)
          .get("/")
          .set({ [idempotencyKey]: "1" })
          .expect(200, "1");
        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()]).toEqual(
          "true",
        );
      });

      it("should return a cached response when key is reused for json endpoint", async () => {
        const res1 = await request(app)
          .get("/json")
          .set({ [idempotencyKey]: "1" })
          .expect(200, { counter: 1 });
        const res2 = await request(app)
          .get("/json")
          .set({ [idempotencyKey]: "1" })
          .expect(200, { counter: 1 });
        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()]).toEqual(
          "true",
        );
      });

      it("should return a cached response when key is reused with request body", async () => {
        const res1 = await request(app)
          .post("/")
          .set({ [idempotencyKey]: "4" })
          .send({ number: 2 })
          .expect(201, "2");

        const res2 = await request(app)
          .post("/")
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
        const res1 = await request(app)
          .get("/error")
          .set({ [idempotencyKey]: "5" })
          .expect(500, { message: "unknown" });

        const res2 = await request(app)
          .get("/error")
          .set({ [idempotencyKey]: "5" })
          .expect(500, { message: "unknown" });

        expect(
          res1.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()],
        ).toBeUndefined();
        expect(res2.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()]).toEqual(
          "true",
        );
      });

      it("should return 400 when idempotency key is not sent when its needed", async () => {
        await request(app).get("/").expect(400);
      });

      it("should return 400 when idempotency key exceeds length", async () => {
        await request(app)
          .get("/")
          .set({ [idempotencyKey]: "2345678" })
          .expect(400);
      });

      it(`should return ${name === "with wait strategy" ? "success for both" : "a conflict"} when parallel requests are made`, async () => {
        if (name === "with wait strategy") {
          const [res1, res2] = await Promise.all([
            request(app)
              .get("/slow")
              .set({ [idempotencyKey]: "2" }),
            request(app)
              .get("/slow")
              .set({ [idempotencyKey]: "2" }),
          ]);

          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.text).toEqual(res2.text);
          expect(res1.text).toEqual("1");
        } else {
          const [res1, res2] = await Promise.all([
            request(app)
              .get("/slow")
              .set({ [idempotencyKey]: "2" })
              .then((res) => res)
              .catch((err) => err),
            request(app)
              .get("/slow")
              .set({ [idempotencyKey]: "2" })
              .then((res) => res)
              .catch((err) => err),
          ]);

          const success = res1.status === 200 ? res1.status : res2.status;
          const conflict = res1.status !== 200 ? res1.status : res2.status;
          const successBody = res1.status === 200 ? res1.text : res2.text;
          const conflictBody = res1.status !== 200 ? res1.body : res2.body;
          const conflictHeader =
            res1.status !== 200 ? res1.headers : res2.headers;
          expect(success).not.toBe(conflict);
          expect(success).toBe(200);
          expect(conflict).toBe(409);
          expect(successBody).toEqual("1");
          expect(conflictBody).toEqual({
            code: "REQUEST_IN_PROGRESS",
            message: "A request is outstanding for this Idempotency-Key",
          });
          expect(
            conflictHeader[HTTPHeaderEnum.retryAfter.toLowerCase()],
          ).toEqual("1");
        }
      });

      it("should return error when different body is used for the same key", async () => {
        const res1 = await request(app)
          .post("/")
          .set({ [idempotencyKey]: "3" })
          .send({ number: 1 })
          .expect(201, "3");

        const res2 = await request(app)
          .post("/")
          .set({ [idempotencyKey]: "3" })
          .send({ number: 2 })
          .expect(422);
        expect(JSON.parse(res2.text)).toEqual({
          code: "IDEMPOTENCY_FINGERPRINT_MISSMATCH",
          message: "Idempotency-Key is already used",
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
