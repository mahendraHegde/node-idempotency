export interface StorageAdapter{
      setIfNotExists(key:string,val:string,{ttl}?:{ttl?:number}):Promise<boolean>
      set(key:string,val:string,{ttl}:{ttl?:number}):Promise<boolean>
      get(key:string):Promise<string>
}