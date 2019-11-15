import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {PayerId} from '../PayerId';

export class PayerChangedEvent implements DomainEventContract {
  public payerId: PayerId;
  public dateTimeOccurred: Date;

  constructor(payerId: PayerId, dateTimeOccurred: Date) {
    this.payerId = payerId;
    this.dateTimeOccurred = dateTimeOccurred;
  }

  public getAggregateId(): UniqueEntityID {
    return this.payerId.id;
  }
}
