/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Manuscript } from '../../domain/Manuscript';

import { ArticleRepoContract } from '../../repos/articleRepo';

import { EditManuscriptResponse as Response } from './editManuscriptResponse';
import type { EditManuscriptDTO as DTO } from './editManuscriptDTO';
import * as Errors from './editManuscriptErrors';

type Context = UsecaseAuthorizationContext;

export class EditManuscriptUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private manuscriptRepo: ArticleRepoContract) {}

  private async getAccessControlContext(
    request: DTO,
    context?: Context
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('edit:manuscript')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    try {
      try {
        manuscript = await this.manuscriptRepo.findById(manuscriptId);
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
