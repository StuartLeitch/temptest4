// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific

import { GetCreditNoteByCustomIdDTO } from './getCreditNoteByCustomIdDTO';
import { GetCreditNoteByCustomIdResponse } from './getCreditNoteByCustomIdResponse';
import { GetCreditNoteByCustomIdErrors } from './getCreditNoteByCustomIdErrors';

export class GetCreditNoteByCustomIdUsecase
  implements
    UseCase<
      GetCreditNoteByCustomIdDTO,
      Promise<GetCreditNoteByCustomIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetCreditNoteByCustomIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetCreditNoteByCustomIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetCreditNoteByCustomIdResponse> {
    const { customId } = request;

    let creditNote: CreditNote;

    try {
      creditNote = await this.creditNoteRepo.getCreditNoteByCustomId(customId);
      return right(Result.ok<CreditNote>(creditNote));
    } catch (e) {
      return left(
        new GetCreditNoteByCustomIdErrors.CreditNoteNotFoundError(customId)
      );
    }
  }
}
