import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {ManuscriptId} from '../../../invoices/domain/ManuscriptId';

export class ManuscriptSubmittedEvent implements DomainEventContract {
  public dateTimeOccurred: Date;
  public manuscriptId: ManuscriptId;

  constructor(manuscriptId: ManuscriptId) {
    this.manuscriptId = manuscriptId;
  }

  public getAggregateId(): UniqueEntityID {
    return this.manuscriptId.id;
  }
}
