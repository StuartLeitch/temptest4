import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { CatalogItem } from '../CatalogItem';

export class JournalUpdated implements DomainEventContract {
  constructor(
    public catalogItem: CatalogItem,
    public dateTimeOccurred: Date = new Date()
  ) {}

  getAggregateId(): UniqueEntityID {
    return this.catalogItem.id;
  }
}
