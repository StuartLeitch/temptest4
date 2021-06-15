// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { Manuscript } from '../../domain/Manuscript';

import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CreateManuscriptResponse as Response } from './createManuscriptResponse';
import type { CreateManuscriptDTO as DTO } from './createManuscriptDTO';

export class CreateManuscriptUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private manuscriptRepo: ManuscriptRepoContract) {}

  private async getAccessControlContext(
    request: DTO,
    context?: Context
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:manuscript')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;

    try {
      const manuscriptProps = request;
      console.log(request);

      // * System creates manuscript
      const maybeManuscript = Manuscript.create(
        manuscriptProps,
        new UniqueEntityID(manuscriptProps.id)
      );

      if (maybeManuscript.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeManuscript.value.message))
        );
      }

      manuscript = maybeManuscript.value;

      const result = await this.manuscriptRepo.save(manuscript);

      if (result.isLeft()) {
        return left(new UnexpectedError(new Error(result.value.message)));
      }

      return right(manuscript);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
