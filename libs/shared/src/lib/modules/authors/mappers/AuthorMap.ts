import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Mapper } from '../../../infrastructure/Mapper';
import { Either } from '../../../core/logic/Either';

import { Author } from '../domain/Author';

export class AuthorMap extends Mapper<Author> {
  public static toDomain(raw: any): Either<GuardFailure, Author> {
    const authorOrError = Author.create(
      {
        name: raw.name,
      },
      new UniqueEntityID(raw.id)
    );

    return authorOrError;
  }

  public static toPersistence(author: Author): any {
    return {
      id: author.id.toString(),
      name: author.name,
    };
  }
}
