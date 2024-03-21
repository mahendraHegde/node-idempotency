import type * as express from "express";

export default (app: express.Application): void => {
  let counter = 0;
  let slowCounter = 0;
  let adCounter = 0;
  let jsonCounter = 0;
  app.get("/", (_, res): void => {
    counter++;
    res.send(`${counter}`);
  });

  app.get("/json", (_, res): void => {
    jsonCounter++;
    res.json({ counter: jsonCounter });
  });

  app.get("/slow", (_, res): void => {
    setTimeout(() => {
      slowCounter++;
      res.send(`${slowCounter}`);
    }, 500);
  });

  app.get("/error", (_, __, next) => {
    next(new Error("unknown"));
  });

  app.post(
    "/",
    (
      req: express.Request<{ Body: { number: number } }>,
      response: express.Response,
    ): void => {
      adCounter += req.body.number;
      response.status(201).send(`${adCounter}`);
    },
  );
};
