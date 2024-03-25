import {
  HttpHeaderKeysEnum,
  Idempotency,
  type IdempotencyParams,
  type IdempotencyParamsWithDefaults,
} from "../../src";
import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory";

describe("Idempotency (Integration Test)", () => {
  let idempotency: Idempotency;

  beforeEach(() => {
    const storage = new MemoryStorageAdapter();
    idempotency = new Idempotency(storage);
  });

  // Success Cases
  it("should cache request and return response on subsequent request with matching idempotency key", async () => {
    const req = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "1" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
    };
    const res = { body: { success: "true" } };
    const idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    const cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);
  });

  it("should skip the request when method specified returns true", async () => {
    const skipRequest = (request: IdempotencyParamsWithDefaults):boolean => {
      return request.method === "POST";
    };
    let req: IdempotencyParams = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "2" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
      options: {
        skipRequest,
      },
    };
    const res = { body: { success: "true" } };
    let idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    let cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toBeUndefined();

    req = { ...req, method: "GET" };
    idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);
    cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);
  });

  // @TODO add more cases
});
