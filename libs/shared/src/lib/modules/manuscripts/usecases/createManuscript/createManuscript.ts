/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Manuscript } from '../../domain/Manuscript';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import type { CreateManuscriptDTO } from './createManuscriptDTO';
import { CreateManuscriptResponse } from './createManuscriptResponse';

export class CreateManuscriptUsecase
  implements
    UseCase<
      CreateManuscriptDTO,
      Promise<CreateManuscriptResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateManuscriptDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private manuscriptRepo: ManuscriptRepoContract) {}

  private async getAccessControlContext(
    request: CreateManuscriptDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:manuscript')
  public async execute(
    request: CreateManuscriptDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateManuscriptResponse> {
    let manuscript: Manuscript;

    try {
      const manuscriptProps: CreateManuscriptDTO = request;

      // * System creates manuscript
      const manuscriptOrError = Manuscript.create(
        manuscriptProps,
        new UniqueEntityID(manuscriptProps.id)
      );

      // This is where all the magic happens
      manuscript = manuscriptOrError.getValue();

      await this.manuscriptRepo.save(manuscript);

      return right(Result.ok<Manuscript>(manuscript));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
