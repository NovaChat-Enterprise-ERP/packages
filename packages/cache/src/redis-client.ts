import { Redis } from 'ioredis';

export const createRedisClient = (url: string, onError: (error: Error) => void = () => undefined): Redis => {
  const redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    lazyConnect: false,
    keepAlive: 15_000,
  });
  redis.on('error', onError);
  return redis;
};

export type { Redis };
