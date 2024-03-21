import * as express from "express";

export default (app: express.Application): void => {
  let counter = 0;
  let slowCounter = 0;
  let adCounter = 0;
  app.get("/", (_,res) => {
     res.send(counter++)
  });

  app.get("/slow", async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return slowCounter++;
  });

  app.get("/error", async () => {
    throw new Error("unknow");
  });

  app.post(
    "/",
    async (
      req: express.Request<{ Body: { number: number } }>,
      response: express.Response,
    ): Promise<number> => {
      adCounter += req.body.number;
      void response.status(201);
      return adCounter;
    },
  );
};
