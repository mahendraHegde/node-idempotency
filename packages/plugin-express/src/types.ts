import type * as express from "express";

export type ExpressMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => Promise<void>;
