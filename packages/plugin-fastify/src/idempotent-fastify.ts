import {
  type FastifyPluginAsync,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import {
  type IdempotencyPluginOptions,
  buildStorageAdapter,
  headers2Cache,
  HTTPHeaderEnum,
  idempotency2HttpCodeMap,
} from "@node-idempotency/shared";
import {
  Idempotency,
  IdempotencyError,
  type IdempotencyParams,
  type IdempotencyResponse,
  IdempotencyErrorCodes,
} from "@node-idempotency/core";

const setHeaders = (
  response: FastifyReply,
  headers: Record<string, string>,
): void => {
  Object.keys(headers).forEach((key) => {
    if (headers[key]) {
      void response.header(key, headers[key]);
    }
  });
};

const onResponse = async (
  request: FastifyRequest,
  reply: FastifyReply,
  payload: Record<string, unknown>,
  nodeIdempotency: Idempotency,
): Promise<void> => {
  const idempotencyReq: IdempotencyParams = {
    headers: request.headers,
    body: request.body as Record<string, unknown>,
    path: request.url,
    method: request.method,
  };

  const { statusCode } = reply;
  const additional = { statusCode };
  Object.values(headers2Cache).forEach((header) => {
    const head = reply.getHeader(header);
    if (head) {
      additional[header] = head;
    }
  });
  const res: IdempotencyResponse = {
    additional,
    ...(statusCode < 400 ? { body: payload } : { error: payload }),
  };
  await nodeIdempotency.onResponse(idempotencyReq, res);
};

const onRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
  nodeIdempotency: Idempotency,
): Promise<void> => {
  const idempotencyReq: IdempotencyParams = {
    headers: request.headers,
    body: request.body as Record<string, unknown>,
    path: request.url,
    method: request.method,
  };
  try {
    const idempotencyResponse: IdempotencyResponse | undefined =
      await nodeIdempotency.onRequest<unknown, Error>(idempotencyReq);
    if (!idempotencyResponse) {
      // fist time request, let it pass
      return;
    }
    // this is a duplicate request
    if (idempotencyResponse.additional?.statusCode) {
      const { statusCode } = idempotencyResponse.additional;
      void reply.status(statusCode as number);
    }
    const headers = Object.values(headers2Cache).reduce<Record<string, string>>(
      (res, cur) => {
        if (idempotencyResponse?.additional?.[cur]) {
          res[cur] = idempotencyResponse.additional[cur] as string;
        }
        return res;
      },
      {},
    );
    setHeaders(reply, {
      ...headers,
      [HTTPHeaderEnum.idempotentReplayed]: "true",
    });
    return await reply.send(
      idempotencyResponse.body || idempotencyResponse.error,
    );
  } catch (err) {
    if (err instanceof IdempotencyError) {
      const status = idempotency2HttpCodeMap[err.code] || 500;
      if (err.code === IdempotencyErrorCodes.REQUEST_IN_PROGRESS) {
        setHeaders(reply, { [HTTPHeaderEnum.retryAfter]: "1" });
      }
      return await reply.status(status).send(err);
    }
  }
};

export const idempotencyAsPlugin: FastifyPluginAsync<
  IdempotencyPluginOptions
> = async (fastify, options) => {
  const storageAdapter = await buildStorageAdapter(options.storage);
  const idempotency = new Idempotency(storageAdapter, options);

  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await onRequest(request, reply, idempotency);
    },
  );

  fastify.addHook(
    "onSend",
    async (
      request: FastifyRequest,
      reply: FastifyReply,
      payload: Record<string, unknown>,
    ) => {
      await onResponse(request, reply, payload, idempotency);
    },
  );

  fastify.addHook("onClose", async () => {
    if (typeof storageAdapter.disconnect === "function") {
      await storageAdapter.disconnect();
    }
  });
};
