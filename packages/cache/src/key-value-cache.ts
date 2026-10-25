export interface KeyValueCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(...keys: string[]): Promise<void>;
  delByPrefix(prefix: string): Promise<void>;
}

export class MemoryCache implements KeyValueCache {
  private readonly store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(...keys: string[]): Promise<void> {
    keys.forEach((k) => this.store.delete(k));
  }

  async delByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key);
  }
}
