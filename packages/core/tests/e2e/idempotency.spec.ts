import {
  HttpHeaderKeysEnum,
  Idempotency,
  type IdempotencyParams,
  type IdempotencyParamsWithDefaults,
} from "../../src";
import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory";

describe("Idempotency (Integration Test)", () => {
  let idempotency: Idempotency;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
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
    const skipRequest = (request: IdempotencyParamsWithDefaults): boolean => {
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

  it("should allow overriding cacheKeyPrefix", async () => {
    const req: IdempotencyParams = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "1" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
      options: {
        cacheKeyPrefix: "tenant-1",
      },
    };
    const res = { body: { success: "true" } };
    const idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    const cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);

    expect(
      await storage.get(`${req.options?.cacheKeyPrefix}:POST:/pay:1`),
    ).toEqual(
      '{"status":"COMPLETE","fingerPrint":"f45aa7a9803525391d546d331b22b3ed4583a11a04797feaeb1027b158c65d10","response":{"body":{"success":"true"}}}',
    );

    // different tenant with same idempotency key
    const cachedResponse2 = await idempotency.onRequest({
      ...req,
      options: {
        cacheKeyPrefix: "tenant-2",
      },
    });

    expect(cachedResponse2).toBeUndefined();
  });

  it("should wait for in-progress request and return response when completed", async () => {
    const req: IdempotencyParams = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "wait-test" },
      path: "/wait",
      body: { test: "wait" },
      method: "POST",
      options: {
        inProgressStrategy: {
          wait: true,
          pollingIntervalMs: 10,
          maxWaitMs: 1000,
        },
      },
    };
    const res = { body: { result: "done" } };

    // First request starts
    const firstRes = await idempotency.onRequest(req);
    expect(firstRes).toBeUndefined();

    // Second request waits
    const secondPromise = idempotency.onRequest(req);

    await idempotency.onResponse(req, res);
    const secondRes = await secondPromise;
    expect(secondRes).toEqual(res);
  });

  it("should throw error when waiting times out", async () => {
    const req: IdempotencyParams = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "timeout-test" },
      path: "/timeout",
      body: { test: "timeout" },
      method: "POST",
      options: {
        inProgressStrategy: {
          wait: true,
          pollingIntervalMs: 10,
          maxWaitMs: 100,
        },
      },
    };

    // First request starts
    await idempotency.onRequest(req);

    // Second request waits but times out
    await expect(idempotency.onRequest(req)).rejects.toThrow(
      "Timed out waiting for in-progress request to complete",
    );
  });

  // @TODO add more cases
});
