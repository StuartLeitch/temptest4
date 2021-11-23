import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Invoice } from '../Invoice';

export class InvoiceMovedToPendingEvent implements DomainEventContract {
  constructor(
    public readonly invoice: Invoice,
    public readonly sender: string,
    public readonly receiver: string,
    public readonly dateTimeOccurred: Date
  ) {}

  public getAggregateId(): UniqueEntityID {
    return this.invoice.invoiceId.id;
  }
}
