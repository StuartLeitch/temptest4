import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

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
    return PublisherId.create(this._id);
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
  ): Either<GuardFailure, Publisher> {
    const defaultValues = {
      ...props,
      dateCreated: props.dateCreated || new Date(),
      dateUpdated: props.dateUpdated || new Date(),
    };

    const publisher = new Publisher(defaultValues, id);

    return right(publisher);
  }
}
