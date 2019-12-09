// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Manuscript } from '../../domain/Manuscript';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../repos/articleRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  EditManuscriptAuthorizationContext
} from './editManuscriptAuthorizationContext';
import { EditManuscriptDTO } from './editManuscriptDTO';
import { EditManuscriptResponse } from './editManuscriptResponse';
import { EditManuscriptErrors } from './editManuscriptErrors';

export class EditManuscriptUsecase
  implements
    UseCase<
      EditManuscriptDTO,
      Promise<EditManuscriptResponse>,
      EditManuscriptAuthorizationContext
    >,
    AccessControlledUsecase<
      EditManuscriptDTO,
      EditManuscriptAuthorizationContext,
      AccessControlContext
    > {
  constructor(private manuscriptRepo: ManuscriptRepoContract) {}

  private async getAccessControlContext(
    request: EditManuscriptDTO,
    context?: EditManuscriptAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('edit:manuscript')
  public async execute(
    request: EditManuscriptDTO,
    context?: EditManuscriptAuthorizationContext
  ): Promise<EditManuscriptResponse> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    try {
      try {
        manuscript = await this.manuscriptRepo.findById(manuscriptId);
      } catch (e) {
        return left(
          new EditManuscriptErrors.ManuscriptFoundError(
            manuscriptId.id.toString()
          )
        );
      }

      // * get author details
      let { authorCountry } = manuscript;
      if (request.authorCountry) {
        manuscript.authorCountry = request.authorCountry;
        authorCountry = request.authorCountry;
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

      await this.manuscriptRepo.update(manuscript);

      return right(Result.ok<Manuscript>(manuscript));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
