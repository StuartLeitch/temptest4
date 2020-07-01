import { DomainEventContract } from '../../contracts/DomainEvent';
import { UniqueEntityID } from '../../../UniqueEntityID';

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
