import {DomainEventContract} from './DomainEvent';

export interface HandleContract<IDomainEventContract> {
  setupSubscriptions(): void;
}
