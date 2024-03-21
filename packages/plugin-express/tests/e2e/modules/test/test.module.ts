import * as express from "express";
import testController from "./test.controller";
import {
  StorageAdapterEnum,
  idempotencyAsMiddleware,
} from "../../../../src/index";

export default async (): Promise<express.Application> => {
  const app = express();
  const middleware = await idempotencyAsMiddleware({
    storageAdapter: StorageAdapterEnum.memory,
    enforceIdempotency: true,
    keyMaxLength: 3,
  });
  app.use(middleware);
  testController(app);
  return app;
};
