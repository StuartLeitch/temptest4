// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';

import { ArticleRepoContract } from '../../repos/articleRepo';
import { Article } from '../../domain/Article';

// * Usecase specific
import { GetArticleDetailsResponse as Response } from './getArticleDetailsResponse';
import type { GetArticleDetailsDTO as DTO } from './getArticleDetailsDTO';
import * as Errors from './getArticleDetailsErrors';

export class GetArticleDetailsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private articleRepo: ArticleRepoContract) {
    super();
  }

  @Authorize('manuscript:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let article: Article;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.articleId)
    );

    try {
      try {
        const maybeArticle = await this.articleRepo.findById(manuscriptId);

        if (maybeArticle.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeArticle.value.message))
          );
        }

        article = maybeArticle.value as Article;
      } catch (e) {
        return left(
          new Errors.ArticleNotFoundError(manuscriptId.id.toString())
        );
      }

      return right(article);
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
