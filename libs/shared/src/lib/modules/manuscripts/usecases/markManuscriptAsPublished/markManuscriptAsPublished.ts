/* eslint-disable @typescript-eslint/no-unused-vars */
// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Manuscript } from '../../domain/Manuscript';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { MarkManuscriptAsPublishedDTO } from './markManuscriptAsPublishedDTO';
import { MarkManuscriptAsPublishedResponse } from './markManuscriptAsPublishedResponse';
import { MarkManuscriptAsPublishedErrors } from './markManuscriptAsPublishedErrors';

export class MarkManuscriptAsPublishedUsecase
  implements
    UseCase<
      MarkManuscriptAsPublishedDTO,
      Promise<MarkManuscriptAsPublishedResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      MarkManuscriptAsPublishedDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private manuscriptRepo: ManuscriptRepoContract) {}

  private async getAccessControlContext(
    request: MarkManuscriptAsPublishedDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('write:manuscript')
  public async execute(
    request: MarkManuscriptAsPublishedDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<MarkManuscriptAsPublishedResponse> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.customId)
    ).getValue();

    try {
      try {
        manuscript = await this.manuscriptRepo.findByCustomId(manuscriptId);
      } catch (e) {
        return left(
          new MarkManuscriptAsPublishedErrors.ManuscriptFoundError(
            manuscriptId.id.toString()
          )
        );
      }

      manuscript.markAsPublished(request.publicationDate);
      await this.manuscriptRepo.update(manuscript);

      return right(Result.ok<Manuscript>(manuscript));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
