import {AggregateRoot} from '../../../../AggregateRoot';
import {MockJobCreatedEvent} from '../events/mockJobCreatedEvent';
import {UniqueEntityID} from '../../../../UniqueEntityID';
import {MockJobDeletedEvent} from '../events/mockJobDeletedEvent';

export class MockJobAggregateRoot extends AggregateRoot<{}> {
  private constructor(props: {}, id?: UniqueEntityID) {
    super(props, id);
  }

  public static createJob(
    props: {},
    id?: UniqueEntityID
  ): MockJobAggregateRoot {
    const job = new this(props, id);
    job.addDomainEvent(new MockJobCreatedEvent(job.id));
    return job;
  }

  public deleteJob(): void {
    this.addDomainEvent(new MockJobDeletedEvent(this.id));
  }
}
