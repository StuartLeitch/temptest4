import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Manuscript } from '../Manuscript';

export class ManuscriptPublished implements DomainEventContract {
  constructor(public manuscript: Manuscript, public dateTimeOccurred: Date) {}

  public getAggregateId(): UniqueEntityID {
    return this.manuscript.id;
  }
}
