export enum errorCodes{
    IDEMPOTENCY_KEY_LEN_EXEEDED="IDEMPOTENCY_KEY_LEN_EXEEDED"

}
export class IdempotentHTTPError extends Error{
    code:errorCodes
    meta?:Record<string,unknown>
    constructor(message:string, code:errorCodes, meta?:Record<string,unknown>){
        super(message)
        this.code = code
        this.meta=meta
    }
}