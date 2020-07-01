import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';
import { DomainEventContract } from './../../../../../../src/lib/core/domain/events/contracts/DomainEvent';

export class MockCouponCreatedEvent implements DomainEventContract {
  dateTimeOccurred: Date;
  id: UniqueEntityID;

  constructor(id: UniqueEntityID) {
    this.id = id;
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.id;
  }
}
