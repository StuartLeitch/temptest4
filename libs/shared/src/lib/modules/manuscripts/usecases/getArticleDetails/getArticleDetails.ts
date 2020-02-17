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

import { ArticleRepoContract } from '../../repos/articleRepo';
import { Article } from '../../domain/Article';

// * Usecase specific
import { GetArticleDetailsResponse } from './getArticleDetailsResponse';
import { GetArticleDetailsErrors } from './getArticleDetailsErrors';
import { GetArticleDetailsDTO } from './getArticleDetailsDTO';

import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';

export type GetArticleDetailsContext = AuthorizationContext<Roles>;

export class GetArticleDetailsUsecase
  implements
    UseCase<
      GetArticleDetailsDTO,
      Promise<GetArticleDetailsResponse>,
      GetArticleDetailsContext
    >,
    AccessControlledUsecase<
      GetArticleDetailsDTO,
      GetArticleDetailsContext,
      AccessControlContext
    > {
  constructor(private articleRepo: ArticleRepoContract) {}

  // @Authorize('article:read')
  public async execute(
    request: GetArticleDetailsDTO,
    context?: GetArticleDetailsContext
  ): Promise<GetArticleDetailsResponse> {
    let article: Article;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.articleId)
    ).getValue();

    try {
      try {
        article = (await this.articleRepo.findById(manuscriptId)) as any;
      } catch (e) {
        return left(
          new GetArticleDetailsErrors.ArticleNotFoundError(
            manuscriptId.id.toString()
          )
        );
      }

      return right(Result.ok(article));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
