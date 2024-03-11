export type HTTPMethods = "get"|"post"|"put"|"patch"|"delete"| "GET"|"POST"|"PUT"|"PATCH"|"DELETE" 
export interface IdempotencyParams{
    headers:Record<string,unknown>,
    path:string,
    body?:Record<string,unknown>,
    method:HTTPMethods
}

export interface IdempotencyResponse<BodyType,ErrorType>{
    headers:Record<string,unknown>,
    body?:BodyType,
    statusCode:number,
    error?: ErrorType
}

export interface Options {
    allowedMethods?:HTTPMethods[],
    excludeMethods?:HTTPMethods[],
    headerKey?:string,
    keyMaxLength?:number,
    cacheKeyPrefix?:string
    cacheTTLMS?:number
}

