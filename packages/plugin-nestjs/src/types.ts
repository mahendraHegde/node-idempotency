export enum StorageAdapterEnum {
  memory = 'memory',
}

export interface SerializedAPIException {
  message: string
  name?: string
  options?: Record<string, unknown>
  response?: { message: string, statusCode: number }
  status?: number
}
