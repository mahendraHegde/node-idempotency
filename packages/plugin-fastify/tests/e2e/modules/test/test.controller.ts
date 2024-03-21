import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";

export default (server: FastifyInstance): void => {
  let counter = 0;
  let slowCounter = 0;
  let adCounter = 0;
  let jsonCounter = 0;
  server.get("/", () => {
    return counter++;
  });

  server.get("/json", () => {
    jsonCounter++;
    return { jsonCounter };
  });

  server.get("/slow", async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return slowCounter++;
  });

  server.get("/error", async () => {
    throw new Error("unknown");
  });

  server.post(
    "/",
    async (
      req: FastifyRequest<{ Body: { number: number } }>,
      reply: FastifyReply,
    ): Promise<number> => {
      adCounter += req.body.number;
      void reply.status(201);
      return adCounter;
    },
  );
};
