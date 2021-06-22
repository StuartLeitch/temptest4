import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { CreditNoteId } from '../CreditNoteId';

export class CreditNoteCreated implements DomainEventContract {
  constructor(
    public creditNoteId: CreditNoteId,
    public dateTimeOccurred: Date
  ) {}

  public getAggregateId(): UniqueEntityID {
    return this.creditNoteId.id;
  }
}
