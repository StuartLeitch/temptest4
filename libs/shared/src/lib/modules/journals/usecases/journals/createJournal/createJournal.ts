// * Core Domain
import {UseCase} from '../../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../../core/logic/Result';
import {AppError} from '../../../../../core/logic/AppError';

import {Email} from './../../../../../domain/Email';
import {Name} from './../../../../../domain/Name';

import {JournalRepoContract} from '../../../repos/journalRepo';
import {Journal, JournalProps} from '../../../domain/Journal';

import {CreateJournalDTO} from './createJournalDTO';
import {CreateJournalResponse} from './createJournalResponse';
import {
  CreateJournalAuthorizationContext,
  AccessControlContext,
  AccessControlledUsecase
} from './createJournalAuthorizationContext';

export class CreateJournal
  implements
    UseCase<
      CreateJournalDTO,
      Promise<CreateJournalResponse>,
      CreateJournalAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateJournalDTO,
      CreateJournalAuthorizationContext,
      AccessControlContext
    > {
  constructor(private journalRepo: JournalRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: CreateJournalDTO,
    context?: CreateJournalAuthorizationContext
  ): Promise<CreateJournalResponse> {
    let journal: Journal;
    let name: Name;
    let email: Email;

    try {
      const nameOrError = Name.create({value: request.name});
      if (nameOrError.isFailure) {
        return left(nameOrError);
      }
      name = nameOrError.getValue();

      const emailOrError = Email.create({value: request.email});
      if (emailOrError.isFailure) {
        return left(emailOrError);
      }
      email = emailOrError.getValue();

      const journalProps: JournalProps = {
        name,
        email,
        issn: request.issn,
        code: request.code,
        articleProcessingCharge: request.articleProcessingCharge,
        isActive: request.isActive
      };

      const journalOrError = Journal.create(journalProps);

      if (journalOrError.isFailure) {
        return left(journalOrError);
      }

      journal = journalOrError.getValue();

      await this.journalRepo.save(journal);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
