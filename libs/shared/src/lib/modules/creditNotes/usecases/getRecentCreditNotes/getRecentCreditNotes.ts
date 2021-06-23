// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left, right } from '../../../../core/logic/Either';

import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specifics
import { GetRecentCreditNotesResponse as Response } from './getRecentCreditNotesResponse';
import { GetRecentCreditNotesDTO as DTO } from './getRecentCreditNotesDTO';
import { GetRecentCreditNotesErrors as Errors } from './getRecentCreditNotesErrors';

// * Authorization logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';
import { UnexpectedError } from '../../../../core/logic/AppError';

export class GetRecentCreditNotesUesecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('credit_note:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    try {
      const maybePaginatedResult = await this.creditNoteRepo.getRecentCreditNotes(
        request
      );

      if (maybePaginatedResult.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePaginatedResult.value.message))
        );
      }

      let paginatedResult = maybePaginatedResult.value;
      return right(paginatedResult);
    } catch (err) {
      return left(new Errors.CreditNotesListFailure(err));
    }
  }
}
