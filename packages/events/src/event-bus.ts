import type { DomainEvent, EventType } from '@novachat-enterprise-erp/contracts';

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

export type NewEvent<T = unknown> = Omit<DomainEvent<T>, 'id' | 'occurredAt' | 'source'>;

export interface EventPublisher {
  publish<T>(event: NewEvent<T>): Promise<void>;
}

export interface EventSubscriber {
  on<T>(type: EventType, handler: EventHandler<T>): this;
  start(): Promise<void>;
  stop(): Promise<void>;
}
