/* eslint-disable @typescript-eslint/no-unused-vars */
// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Manuscript } from '../../domain/Manuscript';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { GetManuscriptByManuscriptIdDTO } from './getManuscriptByManuscriptIdDTO';
import { GetManuscriptByManuscriptIdResponse } from './getManuscriptByManuscriptIdResponse';
import { GetManuscriptByManuscriptIdErrors } from './getManuscriptByManuscriptIdErrors';

export class GetManuscriptByManuscriptIdUsecase
  implements
    UseCase<
      GetManuscriptByManuscriptIdDTO,
      Promise<GetManuscriptByManuscriptIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetManuscriptByManuscriptIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private manuscriptRepo: ManuscriptRepoContract) {}

  private async getAccessControlContext(
    request: GetManuscriptByManuscriptIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('read:manuscript')
  public async execute(
    request: GetManuscriptByManuscriptIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetManuscriptByManuscriptIdResponse> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    try {
      try {
        manuscript = await this.manuscriptRepo.findById(manuscriptId);
      } catch (e) {
        return left(
          new GetManuscriptByManuscriptIdErrors.ManuscriptFoundError(
            manuscriptId.id.toString()
          )
        );
      }

      return right(Result.ok<Manuscript>(manuscript));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
