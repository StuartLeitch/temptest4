/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { ArticleRepoContract } from '../../repos/articleRepo';
import { Article } from '../../domain/Article';

// * Usecase specific
import { GetArticleDetailsResponse } from './getArticleDetailsResponse';
import { GetArticleDetailsErrors } from './getArticleDetailsErrors';
import { GetArticleDetailsDTO } from './getArticleDetailsDTO';

import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';

export class GetArticleDetailsUsecase
  implements
    UseCase<
      GetArticleDetailsDTO,
      Promise<GetArticleDetailsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetArticleDetailsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private articleRepo: ArticleRepoContract) {}

  // @Authorize('article:read')
  public async execute(
    request: GetArticleDetailsDTO,
    context?: UsecaseAuthorizationContext
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
