import type { Redis } from 'ioredis';
import type { KeyValueCache } from './key-value-cache.js';

export class RedisCache implements KeyValueCache {
  constructor(
    private readonly redis: Redis,
    private readonly namespace = 'novachat:cache:',
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(this.namespace + key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.namespace + key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.redis.del(...keys.map((k) => this.namespace + k));
  }

  async delByPrefix(prefix: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', `${this.namespace}${prefix}*`, 'COUNT', 200);
      if (keys.length) await this.redis.del(...keys);
      cursor = next;
    } while (cursor !== '0');
  }
}
