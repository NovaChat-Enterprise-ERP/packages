import type { Redis } from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export interface RateLimiter {
  consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

export class RedisRateLimiter implements RateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly namespace = 'novachat:rl:',
  ) {}

  async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const redisKey = `${this.namespace}${key}:${window}`;
    const results = await this.redis.multi().incr(redisKey).expire(redisKey, windowSeconds).exec();
    const count = Number(results?.[0]?.[1] ?? 0);
    const resetSeconds = windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetSeconds };
  }
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly counts = new Map<string, number>();

  async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const k = `${key}:${window}`;
    const count = (this.counts.get(k) ?? 0) + 1;
    this.counts.set(k, count);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetSeconds: windowSeconds };
  }
}
