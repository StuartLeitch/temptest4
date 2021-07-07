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
import { Manuscript } from '../../domain/Manuscript';

import { ArticleRepoContract } from '../../repos/articleRepo';

import { EditManuscriptResponse as Response } from './editManuscriptResponse';
import type { EditManuscriptDTO as DTO } from './editManuscriptDTO';
import * as Errors from './editManuscriptErrors';

export class EditManuscriptUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private manuscriptRepo: ArticleRepoContract) {
    super();
  }

  @Authorize('manuscript:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    );

    try {
      try {
        const maybeManuscript = await this.manuscriptRepo.findById(
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

      if (request.journalId) {
        manuscript.journalId = request.journalId;
      }

      // * get author details
      if (request.authorCountry) {
        manuscript.authorCountry = request.authorCountry;
      }

      if (request.customId) {
        manuscript.customId = request.customId;
      }

      if (request.title) {
        manuscript.title = request.title;
      }

      if (request.articleType) {
        manuscript.articleType = request.articleType;
      }

      if (request.authorEmail) {
        manuscript.authorEmail = request.authorEmail;
      }

      if (request.authorCountry) {
        manuscript.authorCountry = request.authorCountry;
      }

      if (request.authorSurname) {
        manuscript.authorSurname = request.authorSurname;
      }

      if (request.authorFirstName) {
        manuscript.authorFirstName = request.authorFirstName;
      }

      if (request.preprintValue) {
        manuscript.preprintValue = request.preprintValue;
      }

      try {
        await this.manuscriptRepo.update(manuscript);
      } catch (err) {
        return left(new Errors.ManuscriptUpdateDbError(err));
      }

      return right(manuscript);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
