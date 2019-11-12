// * Core Domain
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {AppError} from '../../../../core/logic/AppError';
import {UseCase} from '../../../../core/domain/UseCase';

// * Authorization Logic
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import {ArticleRepoContract} from '../../repos/articleRepo';
import {ArticleId} from '../../domain/ArticleId';
import {Article} from '../../domain/Article';

// * Usecase specific
import {GetArticleDetailsResponse} from './getArticleDetailsResponse';
import {GetArticleDetailsErrors} from './getArticleDetailsErrors';
import {GetArticleDetailsDTO} from './getArticleDetailsDTO';

import {ArticleMap} from '../../mappers/ArticleMap';

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
  constructor() {}

  @Authorize('article:read')
  public async execute(
    request: GetArticleDetailsDTO,
    context?: GetArticleDetailsContext
  ): Promise<GetArticleDetailsResponse> {
    return Promise.resolve(
      right(
        Result.ok(
          ArticleMap.toDomain({
            id: 'article-1',
            title: 'The strange case of John Doe and Jane Doe',
            articleTypeId: 'type-1'
          })
        )
      )
    );
  }
}
