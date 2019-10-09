import {DomainEventContract} from './DomainEvent';

export interface EventBusContract {
  publish<T extends DomainEventContract>(event: T);
  publishAll(events: DomainEventContract[]);
}
