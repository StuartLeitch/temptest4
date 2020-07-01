import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';
import { DomainEventContract } from './../../../../../../src/lib/core/domain/events/contracts/DomainEvent';

export class MockCouponUpdatedEvent implements DomainEventContract {
  dateTimeOccurred: Date;
  id: UniqueEntityID;

  constructor(id: UniqueEntityID) {
    this.dateTimeOccurred = new Date();
    this.id = id;
  }

  getAggregateId(): UniqueEntityID {
    return this.id;
  }
}
