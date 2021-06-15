// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

interface AuthorProps {
  name: string;
}

export class Author extends AggregateRoot<AuthorProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: AuthorProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: AuthorProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Author> {
    const author = new Author(
      {
        ...props,
      },
      id
    );
    return right(author);
  }
}
