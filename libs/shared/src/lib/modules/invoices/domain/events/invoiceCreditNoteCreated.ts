import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { InvoiceId } from '../InvoiceId';

export class InvoiceCreditNoteCreated implements DomainEventContract {
  constructor(public creditNoteId: InvoiceId, public dateTimeOccurred: Date) {}

  public getAggregateId(): UniqueEntityID {
    return this.creditNoteId.id;
  }
}
