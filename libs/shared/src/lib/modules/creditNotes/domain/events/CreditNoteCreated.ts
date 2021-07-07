import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { CreditNoteId } from '../../../creditNotes/domain/CreditNoteId';

export class CreditNoteCreated implements DomainEventContract {
  constructor(
    public invoiceId: InvoiceId,
    public creditNoteId: CreditNoteId,
    public dateTimeOccurred: Date
  ) {}

  public getAggregateId(): UniqueEntityID {
    return this.invoiceId.id;
  }
}
