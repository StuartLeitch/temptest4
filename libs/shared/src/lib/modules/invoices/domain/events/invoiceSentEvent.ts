import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {InvoiceId} from '../InvoiceId';

export class InvoiceSentEvent implements DomainEventContract {
  public invoiceId: InvoiceId;
  public dateTimeOccurred: Date;

  constructor(invoiceId: InvoiceId, dateTimeOccurred: Date) {
    this.invoiceId = invoiceId;
    this.dateTimeOccurred = dateTimeOccurred;
  }

  public getAggregateId(): UniqueEntityID {
    return this.invoiceId.id;
  }
}
