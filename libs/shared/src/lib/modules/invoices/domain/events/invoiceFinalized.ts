import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { InvoiceId } from '../InvoiceId';

export class InvoiceFinalizedEvent implements DomainEventContract {
  constructor(public invoiceId: InvoiceId, public dateTimeOccurred: Date) {}

  public getAggregateId(): UniqueEntityID {
    return this.invoiceId.id;
  }
}
