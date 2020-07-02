import { DomainEventContract } from '../../contracts/DomainEvent';
import { UniqueEntityID } from '../../../UniqueEntityID';

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
