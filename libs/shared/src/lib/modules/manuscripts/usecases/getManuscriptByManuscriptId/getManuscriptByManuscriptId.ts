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

import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

import { GetManuscriptByManuscriptIdResponse as Response } from './getManuscriptByManuscriptIdResponse';
import type { GetManuscriptByManuscriptIdDTO as DTO } from './getManuscriptByManuscriptIdDTO';
import * as Errors from './getManuscriptByManuscriptIdErrors';

export class GetManuscriptByManuscriptIdUsecase
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

  @Authorize('read:manuscript')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    );

    try {
      try {
        const manuscript = await this.manuscriptRepo.findById(manuscriptId);

        if (manuscript.isLeft()) {
          return left(
            new Errors.ManuscriptFoundError(manuscriptId.id.toString())
          );
        }

        return right(manuscript.value);
      } catch (e) {
        return left(
          new Errors.ManuscriptFoundError(manuscriptId.id.toString())
        );
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
