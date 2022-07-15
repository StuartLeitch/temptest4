// * Core Domain
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {UnexpectedError} from '../../../../core/logic/AppError';
import {right, left} from '../../../../core/logic/Either';
import {UseCase} from '../../../../core/domain/UseCase';

import type {UsecaseAuthorizationContext as Context} from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import {ManuscriptId} from './../../../manuscripts/domain/ManuscriptId';
import {Manuscript} from '../../../manuscripts/domain/Manuscript';

import {UpdateManuscriptAuthorDTO as DTO} from './updateManuscriptAuthorDTO';
import {UpdateManuscriptAuthorResponse as Response} from './updateManuscriptAuthorResponse';
import * as Errors from './updateManuscriptAuthorErrors';
import {ArticleRepoContract} from '../../repos';
import {LoggerContract} from '../../../../infrastructure/logging';
import {UseCaseError} from "../../../../core/logic";
import {VError} from "verror";

export class UpdateManuscriptAuthorUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private articleRepo: ArticleRepoContract,
    private logger: LoggerContract
  ) {
    super();
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    );
    try {
      const maybeManuscript = await this.articleRepo.findById(manuscriptId);

      if (maybeManuscript.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeManuscript.value.message))
        );
      }

      manuscript = maybeManuscript.value;

      manuscript.authorFirstName = request?.correspondingAuthorFirstName;
      manuscript.authorCountry = request?.correspondingAuthorCountry;
      manuscript.authorSurname = request?.correspondingAuthorSurname;
      manuscript.articleType = request?.articleType;
      manuscript.authorEmail = request?.correspondingAuthorEmail;
      manuscript.customId = request?.customId;
      manuscript.title = request?.title;

      await this.articleRepo.update(manuscript);

      return right(null);
    } catch (err) {
      this.logger.error(`An error occurred: ${err.value.message}`, err);
      return left(new VError(err, err.message));
    }
  }
}
