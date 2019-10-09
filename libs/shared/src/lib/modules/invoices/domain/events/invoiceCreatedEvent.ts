import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {InvoiceId} from '../InvoiceId';

export class InvoiceCreatedEvent implements DomainEventContract {
  public dateTimeOccurred: Date;
  public invoiceId: InvoiceId;

  constructor(invoiceId: InvoiceId, dateTimeOccurred: Date) {
    this.invoiceId = invoiceId;
    this.dateTimeOccurred = dateTimeOccurred;
  }

  public getAggregateId(): UniqueEntityID {
    return this.invoiceId.id;
  }
}
