import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';

import {Author} from '../domain/Author';

export class AuthorMap extends Mapper<Author> {
  public static toDomain(raw: any): Author {
    const authorOrError = Author.create(
      {
        name: raw.name
      },
      new UniqueEntityID(raw.id)
    );

    return authorOrError.isSuccess ? authorOrError.getValue() : null;
  }

  public static toPersistence(author: Author): any {
    return {
      id: author.id.toString(),
      name: author.name
    };
  }
}
