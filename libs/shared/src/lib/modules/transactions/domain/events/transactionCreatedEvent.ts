import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {TransactionId} from '../TransactionId';

export class TransactionCreatedEvent implements DomainEventContract {
  public dateTimeOccurred: Date;
  public transactionId: TransactionId;

  constructor(transactionId: TransactionId, dateTimeOccurred: Date) {
    this.transactionId = transactionId;
    this.dateTimeOccurred = dateTimeOccurred;
  }

  public getAggregateId(): UniqueEntityID {
    return this.transactionId.id;
  }
}
