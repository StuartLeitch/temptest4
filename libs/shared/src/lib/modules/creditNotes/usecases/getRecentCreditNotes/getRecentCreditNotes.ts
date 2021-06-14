// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specifics
import { GetRecentCreditNotesResponse } from './getRecentCreditNotesResponse';
import { GetRecentCreditNotesDTO } from './getRecentCreditNotesDTO';
import { GetRecentCreditNotesErrors } from './getRecentCreditNotesErrors';

// * Authorization logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

export class GetRecentCreditNotesUesecase
  implements
    UseCase<
      GetRecentCreditNotesDTO,
      Promise<GetRecentCreditNotesResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetRecentCreditNotesDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('credit_note:read')
  public async execute(
    request: GetRecentCreditNotesDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetRecentCreditNotesResponse> {
    try {
      const paginatedResult = await this.creditNoteRepo.getRecentCreditNotes(
        request
      );
      return right(Result.ok<any>(paginatedResult));
    } catch (err) {
      return left(new GetRecentCreditNotesErrors.CreditNotesListFailure(err));
    }
  }
}
