import {DomainEventContract} from './DomainEvent';

export interface EventPublisherContract {
  publish<T extends DomainEventContract>(event: T);
}
