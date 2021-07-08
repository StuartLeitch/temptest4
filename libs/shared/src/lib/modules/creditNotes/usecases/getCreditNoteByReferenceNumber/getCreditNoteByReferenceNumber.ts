/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteByReferenceNumberResponse as Response } from './getCreditNoteByReferenceNumberResponse';
import * as Errors from './getCreditNoteByReferenceNumberErrors';
import type { GetCreditNoteByReferenceNumberDTO as DTO } from './getCreditNoteByReferenceNumberDTO';

// to be modified with Guard/Either
export class GetCreditNoteByReferenceNumberUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('creditNote:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { referenceNumber } = request;

    let creditNote: CreditNote;
    try {
      try {
        // * System identifies credit note by  invoice reference number
        const maybeCreditNote = await this.creditNoteRepo.getCreditNoteByReferenceNumber(
          referenceNumber
        );

        if (maybeCreditNote.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeCreditNote.value.message))
          );
        }
        creditNote = maybeCreditNote.value;
      } catch (err) {
        return left(new Errors.CreditNoteNotFoundError(referenceNumber));
      }
      return right(creditNote);
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
