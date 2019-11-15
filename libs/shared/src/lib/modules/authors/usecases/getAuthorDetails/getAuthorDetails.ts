// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { Author } from '../../domain/Author';

// * Usecase specific
import { GetAuthorDetailsResponse } from './getAuthorDetailsResponse';
import { GetAuthorDetailsErrors } from './getAuthorDetailsErrors';
import { GetAuthorDetailsDTO } from './getAuthorDetailsDTO';

import { AuthorMap } from '../../mappers/AuthorMap';

export type GetAuthorDetailsContext = AuthorizationContext<Roles>;

export class GetAuthorDetailsUsecase
  implements
    UseCase<
      GetAuthorDetailsDTO,
      Promise<GetAuthorDetailsResponse>,
      GetAuthorDetailsContext
    >,
    AccessControlledUsecase<
      GetAuthorDetailsDTO,
      GetAuthorDetailsContext,
      AccessControlContext
    > {
  constructor() {}

  public async execute(
    request: GetAuthorDetailsDTO,
    context?: GetAuthorDetailsContext
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
          name
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
