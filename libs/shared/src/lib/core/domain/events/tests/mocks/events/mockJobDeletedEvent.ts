import {DomainEventContract} from '../../../contracts/DomainEvent';
import {UniqueEntityID} from '../../../../UniqueEntityID';

export class MockJobDeletedEvent implements DomainEventContract {
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
