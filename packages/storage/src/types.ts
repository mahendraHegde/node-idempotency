export interface StorageAdapter {
  setIfNotExists: (
    key: string,
    val: string,
    { ttl }?: { ttl?: number },
  ) => Promise<boolean>;
  set: (key: string, val: string, { ttl }: { ttl?: number }) => Promise<void>;
  get: (key: string) => Promise<string | undefined>;
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
}
