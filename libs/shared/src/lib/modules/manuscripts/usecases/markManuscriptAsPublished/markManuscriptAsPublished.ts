// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext as Context,
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { Manuscript } from '../../domain/Manuscript';

import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

import { MarkManuscriptAsPublishedResponse as Response } from './markManuscriptAsPublishedResponse';
import { MarkManuscriptAsPublishedDTO as DTO } from './markManuscriptAsPublishedDTO';
import * as Errors from './markManuscriptAsPublishedErrors';

export class MarkManuscriptAsPublishedUsecase
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

  @Authorize('write:manuscript')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.customId)
    );

    try {
      try {
        const maybeManuscript = await this.manuscriptRepo.findByCustomId(
          manuscriptId
        );

        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscript = maybeManuscript.value;
      } catch (e) {
        return left(
          new Errors.ManuscriptFoundError(manuscriptId.id.toString())
        );
      }

      manuscript.markAsPublished(request.publicationDate);
      await this.manuscriptRepo.update(manuscript);

      return right(manuscript);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
