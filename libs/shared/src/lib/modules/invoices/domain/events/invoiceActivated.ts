import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Invoice} from '../Invoice';

export class InvoiceActivated implements DomainEventContract {
  constructor(public invoice: Invoice, public dateTimeOccurred: Date) {}

  public getAggregateId(): UniqueEntityID {
    return this.invoice.id;
  }
}
