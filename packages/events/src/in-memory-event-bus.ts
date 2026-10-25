import { randomUUID } from 'node:crypto';
import type { DomainEvent, EventType } from '@novachat-enterprise-erp/contracts';
import type { EventHandler, EventPublisher, EventSubscriber, NewEvent } from './event-bus.js';

export class InMemoryEventBus implements EventPublisher, EventSubscriber {
  readonly published: DomainEvent[] = [];
  private readonly handlers = new Map<EventType, EventHandler[]>();

  constructor(private readonly source = 'test') {}

  async publish<T>(event: NewEvent<T>): Promise<void> {
    const full: DomainEvent<T> = {
      ...event,
      id: randomUUID(),
      source: this.source,
      occurredAt: new Date().toISOString(),
    };
    this.published.push(full);
    for (const handler of this.handlers.get(event.type) ?? []) {
      await handler(full as DomainEvent);
    }
  }

  on<T>(type: EventType, handler: EventHandler<T>): this {
    this.handlers.set(type, [...(this.handlers.get(type) ?? []), handler as EventHandler]);
    return this;
  }

  async start(): Promise<void> {}

  async stop(): Promise<void> {}

  ofType<T>(type: EventType): DomainEvent<T>[] {
    return this.published.filter((e) => e.type === type) as DomainEvent<T>[];
  }
}
