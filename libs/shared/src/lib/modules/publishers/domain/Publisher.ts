import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

import { PublisherCustomValues } from './PublisherCustomValues';
import { PublisherId } from './PublisherId';

interface PublisherProps {
  customValues: PublisherCustomValues;
  dateCreated?: Date;
  dateUpdated?: Date;
  name: string;
}

export class Publisher extends AggregateRoot<PublisherProps> {
  get publisherId(): PublisherId {
    return PublisherId.create(this._id).getValue();
  }

  get name(): string {
    return this.props.name;
  }

  get dateCreated(): Date | null {
    const date = this.props.dateCreated;
    return date || null;
  }

  get dateUpdated(): Date | null {
    const date = this.props.dateCreated;
    return date || null;
  }

  get customValue(): PublisherCustomValues {
    return this.props.customValues;
  }

  private constructor(props: PublisherProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: PublisherProps,
    id?: UniqueEntityID
  ): Result<Publisher> {
    const defaultValues = {
      ...props,
      dateCreated: props.dateCreated || new Date(),
      dateUpdated: props.dateUpdated || new Date()
    };

    const publisher = new Publisher(defaultValues, id);

    return Result.ok(publisher);
  }
}
