import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {InvoiceId} from '../InvoiceId';
import {PaymentId} from '../../../payments/domain/PaymentId';

export class InvoicePaidEvent implements DomainEventContract {
  public invoiceId: InvoiceId;
  public paymentId: PaymentId;
  public dateTimeOccurred: Date;

  constructor(invoiceId: InvoiceId,paymentId: PaymentId, dateTimeOccurred: Date) {
    this.invoiceId = invoiceId;
    this.dateTimeOccurred = dateTimeOccurred;
    this.paymentId = paymentId;
  }

  public getAggregateId(): UniqueEntityID {
    return this.invoiceId.id;
  }
}
