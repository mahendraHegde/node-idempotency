import * as express from "express";
import * as bodyParser from "body-parser";
import testController from "./test.controller";
import {
  type IdempotencyPluginOptions,
  StorageAdapterEnum,
  idempotencyAsMiddleware,
} from "../../../../src/index";

function errorHandler(
  err: Error,
  _,
  res: express.Response,
  next: express.NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }
  const { statusCode } = res;
  res
    .status(statusCode >= 400 ? statusCode : 500)
    .json({ ...err, message: err.message });
}

const createApp = async (
  options: Partial<IdempotencyPluginOptions> = {},
): Promise<express.Application> => {
  const app = express();
  app.use(bodyParser.json());
  const middleware = await idempotencyAsMiddleware({
    storage: { adapter: StorageAdapterEnum.memory },
    enforceIdempotency: true,
    keyMaxLength: 3,
    ...options,
  });
  app.use(middleware);
  testController(app);
  app.use(errorHandler);

  return app;
};

export const createAppNoWait = async (): Promise<express.Application> =>
  createApp();
export const createAppWait = async (): Promise<express.Application> =>
  createApp({
    inProgressStrategy: {
      wait: true,
      pollingIntervalMs: 50,
      maxWaitMs: 10000,
    },
  });

export default createAppNoWait;
