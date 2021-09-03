// * Core Domain
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

import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteIdsResponse as Response } from './getCreditNoteIdsResponse';
import type { GetCreditNoteIdsDTO as DTO } from './getCreditNoteIdsDTO';
import * as Errors from './getCreditNoteIdsErrors';

export class GetCreditNoteIdsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {
    super();
  }

  @Authorize('invoices:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      let generator: AsyncGenerator<string, void, undefined>;
      try {
        generator = this.getCreditNoteIds(request);
      } catch (err) {
        return left(new Errors.FilteringCreditNotesDbError(err));
      }
      return right(generator);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async *getCreditNoteIds({
    omitDeleted,
    creditNoteIds,
    journalIds,
  }: DTO) {
    const items = this.creditNoteRepo.getCreditNoteIds(
      creditNoteIds,
      journalIds,
      omitDeleted
    );
    yield* items;
  }
}
