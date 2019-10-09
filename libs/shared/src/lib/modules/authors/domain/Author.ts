// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

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
  ): Result<Author> {
    const author = new Author(
      {
        ...props
      },
      id
    );
    return Result.ok<Author>(author);
  }
}
