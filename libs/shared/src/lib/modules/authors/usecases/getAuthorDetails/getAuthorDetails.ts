/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { GetAuthorDetailsResponse } from './getAuthorDetailsResponse';
import { GetAuthorDetailsErrors } from './getAuthorDetailsErrors';
import { GetAuthorDetailsDTO } from './getAuthorDetailsDTO';

import { AuthorMap } from '../../mappers/AuthorMap';

export class GetAuthorDetailsUsecase
  implements
    UseCase<
      GetAuthorDetailsDTO,
      Promise<GetAuthorDetailsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetAuthorDetailsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  public async execute(
    request: GetAuthorDetailsDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetAuthorDetailsResponse> {
    const { article } = request;

    if (!article) {
      return left(new GetAuthorDetailsErrors.NoArticleForAuthor());
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
        return right(Result.ok(author));
      } catch (e) {
        return left(
          new GetAuthorDetailsErrors.AuthorNotFoundError(article.id.toString())
        );
      }
    }
  }
}
