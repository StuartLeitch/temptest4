// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * Usecase specifics
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

import { GetRecentCreditNotesResponse as Response } from './getRecentCreditNotesResponse';
import type { GetRecentCreditNotesDTO as DTO } from './getRecentCreditNotesDTO';
import * as Errors from './getRecentCreditNotesErrors';

export class GetRecentCreditNotesUsecase
  extends AccessControlledUsecase<
    DTO,
    UsecaseAuthorizationContext,
    AccessControlContext
  >
  implements UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext> {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {
    super();
  }

  @Authorize('creditNotes:read')
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
