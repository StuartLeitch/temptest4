// * Core Domain
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { ManuscriptId } from '../../domain/ManuscriptId';

import { ArticleRepoContract } from '../../repos/articleRepo';

// * Usecase specific
import { ExistsManuscriptByIdResponse as Response } from './existsManuscriptByIdResponse';
import { ExistsManuscriptByIdDTO as DTO } from './existsManuscriptByIdDTO';
import * as Errors from './existsManuscriptByIdErrors';

export class ExistsManuscriptByIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private manuscriptRepo: ArticleRepoContract) {
    super();
  }

  @Authorize('manuscript:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      if (!request.manuscriptId) {
        return left(new Errors.ManuscriptIdRequiredError());
      }

      const manuscriptId = ManuscriptId.create(
        new UniqueEntityID(request.manuscriptId)
      );

      try {
        const maybeResult = await this.manuscriptRepo.findById(manuscriptId);

        if (maybeResult.isLeft()) {
          if (
            maybeResult.value instanceof RepoError &&
            maybeResult.value.code === RepoErrorCode.ENTITY_NOT_FOUND
          ) {
            return right(false);
          } else {
            return left(
              new Errors.ManuscriptExistsByIdDbError(
                new Error(maybeResult.value.message),
                request.manuscriptId
              )
            );
          }
        } else {
          if (maybeResult.value) {
            return right(true);
          } else {
            return right(false);
          }
        }
      } catch (err) {
        return left(
          new Errors.ManuscriptExistsByIdDbError(err, request.manuscriptId)
        );
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
