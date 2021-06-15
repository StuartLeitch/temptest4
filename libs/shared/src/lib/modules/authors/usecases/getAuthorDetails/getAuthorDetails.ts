// * Core Domain
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

// * Usecase specific
import { AuthorMap } from '../../mappers/AuthorMap';

import { GetAuthorDetailsResponse as Response } from './getAuthorDetailsResponse';
import { GetAuthorDetailsDTO as DTO } from './getAuthorDetailsDTO';
import * as Errors from './getAuthorDetailsErrors';

export class GetAuthorDetailsUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { article } = request;

    if (!article) {
      return left(new Errors.NoArticleForAuthor());
    } else {
      try {
        const country = article.authorCountry;
        const name = article.authorSurname;
        const email = article.authorEmail;

        const author = AuthorMap.toDomain({
          country,
          email,
          name,
        });
        if (author.isLeft()) {
          return left(author.value);
        }

        return right(author.value);
      } catch (e) {
        return left(new Errors.AuthorNotFoundError(article.id.toString()));
      }
    }
  }
}
