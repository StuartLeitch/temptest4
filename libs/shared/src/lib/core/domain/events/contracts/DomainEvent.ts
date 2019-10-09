import {UniqueEntityID} from '../../UniqueEntityID';

export interface DomainEventContract {
  dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityID;
}
