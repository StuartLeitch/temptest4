import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Payment } from '../Payment';

export class PaymentCompleted implements DomainEventContract {
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly payment: Payment,
    public readonly isFinal: boolean
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.payment.id;
  }
}
