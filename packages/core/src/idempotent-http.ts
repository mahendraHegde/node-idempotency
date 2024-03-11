import { StorageAdapter } from "@idempotent-http/storage";
import { IdempotencyParams, IdempotencyResponse, Options } from "./types";
import { IDEMPOTENCY_CACHE_KEY_PREFIX, IDEMPOTENCY_CACHE_TTL_MS, IDEMPOTENCY_HEADER_KEY, IDEMPOTENCY_KEY_LEN } from "./constants";
import { IdempotentHTTPError, errorCodes } from "./error";
export class IdempotentHTTP {
  options: Required<Options>;
  constructor(
    private storage: StorageAdapter,
    options?: Options
  ) {
    this.options = {
        allowedMethods:[],
        excludeMethods:[],
        cacheKeyPrefix:IDEMPOTENCY_CACHE_KEY_PREFIX,
        headerKey:IDEMPOTENCY_HEADER_KEY,
        keyMaxLength:IDEMPOTENCY_KEY_LEN,
        cacheTTLMS: IDEMPOTENCY_CACHE_TTL_MS,
        ...options}
  }

  private isEnabled(req: IdempotencyParams): boolean {
    if (
      this.options.allowedMethods?.length &&
      !this.options.allowedMethods.includes(req.method)
    ) {
      return false;
    }
    if (this.options.excludeMethods?.includes(req.method)) {
      return false;
    }
    const idempotencyKey = req.headers[this.options.headerKey];
    if (!idempotencyKey) {
      return false;
    }
    return true;
  }

  private validateRequest(req:IdempotencyParams){
    const idempotencyKey = req.headers[this.options.headerKey] as string;
    if(idempotencyKey.length>this.options.keyMaxLength){
        throw new IdempotentHTTPError(`Idempotency-Key length exceeds max allowed length`,errorCodes.IDEMPOTENCY_KEY_LEN_EXEEDED)
    }
  }

  private getIdempotencyKey(req:IdempotencyParams):string{
    const idempotencyKey = req.headers[this.options.headerKey] as string;
    const {path,method} = req
    return `${this.options.cacheKeyPrefix}:${method}:${path}:${idempotencyKey}`
  }

  async onRequest<BodyType, ErrorType>(
    req: IdempotencyParams
  ): Promise<IdempotencyResponse<BodyType, ErrorType>|void> {
    if(this.isEnabled(req)){
        this.validateRequest(req)
        const alreadySeen = await this.storage.setIfNotExists(this.getIdempotencyKey(req),"",{ttl:this.options.cacheTTLMS})
        if(alreadySeen){

        }else{
          
        }
    }
    return 
  }
}
