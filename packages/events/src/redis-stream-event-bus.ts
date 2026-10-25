import { randomUUID } from 'node:crypto';
import { Redis } from 'ioredis';
import type { Logger } from 'pino';
import type { DomainEvent, EventType } from '@novachat-enterprise-erp/contracts';
import type { EventHandler, EventPublisher, EventSubscriber, NewEvent } from './event-bus.js';

export const DEFAULT_STREAM = 'novachat:events';

export interface RedisStreamOptions {
  redisUrl: string;
  source: string;
  stream?: string;
  maxLen?: number;
}

export class RedisStreamEventPublisher implements EventPublisher {
  private readonly redis: Redis;
  private readonly stream: string;
  private readonly maxLen: number;

  constructor(private readonly options: RedisStreamOptions) {
    this.redis = new Redis(options.redisUrl, { maxRetriesPerRequest: 3, lazyConnect: true, keepAlive: 15_000 });
    this.redis.on('error', () => undefined);
    this.stream = options.stream ?? DEFAULT_STREAM;
    this.maxLen = options.maxLen ?? 50_000;
  }

  async publish<T>(event: NewEvent<T>): Promise<void> {
    const full: DomainEvent<T> = {
      ...event,
      id: randomUUID(),
      source: this.options.source,
      occurredAt: new Date().toISOString(),
    };
    await this.redis.xadd(this.stream, 'MAXLEN', '~', this.maxLen, '*', 'type', full.type, 'event', JSON.stringify(full));
  }

  async close(): Promise<void> {
    await this.redis.quit().catch(() => undefined);
  }
}

export interface RedisStreamSubscriberOptions extends RedisStreamOptions {
  group: string;
  consumer?: string;
  blockMs?: number;
  batchSize?: number;
  logger: Logger;
}

type StreamEntries = [string, [string, string[]][]][] | null;

class ReadTimeoutError extends Error {}

const READ_GRACE_MS = 10_000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ReadTimeoutError(`Stream read exceeded ${ms}ms`)), ms);
    promise.then(
      (value) => (clearTimeout(timer), resolve(value)),
      (error) => (clearTimeout(timer), reject(error)),
    );
  });

export class RedisStreamEventSubscriber implements EventSubscriber {
  private readonly redis: Redis;
  private readonly handlers = new Map<EventType, EventHandler[]>();
  private readonly stream: string;
  private readonly consumer: string;
  private running = false;
  private loop: Promise<void> | null = null;

  constructor(private readonly options: RedisStreamSubscriberOptions) {
    this.redis = new Redis(options.redisUrl, { maxRetriesPerRequest: null, lazyConnect: true, keepAlive: 15_000 });
    this.redis.on('error', (err) => options.logger.warn({ err: err.message }, 'Event stream connection error; reconnecting'));
    this.stream = options.stream ?? DEFAULT_STREAM;
    this.consumer = options.consumer ?? `${options.source}-${process.pid}-${randomUUID().slice(0, 8)}`;
  }

  on<T>(type: EventType, handler: EventHandler<T>): this {
    this.handlers.set(type, [...(this.handlers.get(type) ?? []), handler as EventHandler]);
    return this;
  }

  async start(): Promise<void> {
    if (this.running || this.handlers.size === 0) return;
    await this.redis.connect().catch(() => undefined);
    try {
      await this.redis.xgroup('CREATE', this.stream, this.options.group, '$', 'MKSTREAM');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('BUSYGROUP')) throw error;
    }
    this.running = true;
    this.loop = this.run();
  }

  async stop(): Promise<void> {
    this.running = false;
    this.redis.disconnect();
    await this.loop?.catch(() => undefined);
  }

  private async run(): Promise<void> {
    let recovering = true;
    while (this.running) {
      try {
        await this.drain(recovering ? '0' : '>');
        recovering = false;
      } catch (error) {
        if (!this.running) return;
        recovering = true;
        if (error instanceof ReadTimeoutError) {
          this.options.logger.warn('Event stream read stalled; reconnecting');
          this.redis.disconnect(true);
        } else {
          this.options.logger.error({ err: error }, 'Event stream read failed');
        }
        await new Promise((r) => setTimeout(r, 1_000));
      }
    }
  }

  private async drain(fromId: '0' | '>'): Promise<void> {
    const blockMs = fromId === '>' ? (this.options.blockMs ?? 20_000) : 1;
    const result = (await withTimeout(this.redis.xreadgroup(
      'GROUP',
      this.options.group,
      this.consumer,
      'COUNT',
      this.options.batchSize ?? 50,
      'BLOCK',
      blockMs,
      'STREAMS',
      this.stream,
      fromId,
    ), blockMs + READ_GRACE_MS)) as StreamEntries;
    if (!result) return;

    for (const [, entries] of result) {
      for (const [entryId, fields] of entries) {
        await this.handle(entryId, fields);
      }
    }
  }

  private async handle(entryId: string, fields: string[]): Promise<void> {
    const raw = fields[fields.indexOf('event') + 1];
    try {
      const event = JSON.parse(raw ?? 'null') as DomainEvent | null;
      if (event) {
        for (const handler of this.handlers.get(event.type) ?? []) {
          await handler(event);
        }
      }
      await this.redis.xack(this.stream, this.options.group, entryId);
    } catch (error) {
      this.options.logger.error({ err: error, entryId }, 'Event handler failed; will retry on restart');
    }
  }
}

export class NoopEventPublisher implements EventPublisher {
  async publish(): Promise<void> {}
}
