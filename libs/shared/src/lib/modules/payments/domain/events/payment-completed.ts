import { DomainEventContract } from '../../../../core/domain/events/contracts/DomainEvent';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Payment } from '../Payment';

export class PaymentCompleted implements DomainEventContract {
  public dateTimeOccurred: Date;
  public payment: Payment;

  constructor(payment: Payment) {
    this.dateTimeOccurred = new Date();
    this.payment = payment;
  }

  getAggregateId(): UniqueEntityID {
    return this.payment.id;
  }
}
