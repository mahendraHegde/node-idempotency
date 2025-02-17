import {
  type InjectionToken,
  type ModuleMetadata,
  type OptionalFactoryDependency,
} from "@nestjs/common";
import { type IdempotencyPluginOptions } from "@node-idempotency/shared";

export interface SerializedAPIException {
  message: string;
  name?: string;
  options?: Record<string, unknown>;
  response?: { message: string; statusCode: number };
  status?: number;
}

export type RootAsyncRegisterOptions =
  | IdempotencyPluginOptions
  | (Pick<ModuleMetadata, "imports"> & {
      useFactory?: (
        ...args: any[]
      ) => Promise<IdempotencyPluginOptions> | IdempotencyPluginOptions;
      inject?: Array<InjectionToken | OptionalFactoryDependency>;
    });
