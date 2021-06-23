/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteByReferenceNumberResponse } from './getCreditNoteByReferenceNumberResponse';
import { GetCreditNoteByReferenceNumberErrors } from './getCreditNoteByReferenceNumberErrors';
import { GetCreditNoteByReferenceNumberDTO } from './getCreditNoteByReferenceNumberDTO';

// to be modified with Guard/Either
export class GetCreditNoteByReferenceNumberUsecase
  implements
    UseCase<
      GetCreditNoteByReferenceNumberDTO,
      Promise<GetCreditNoteByReferenceNumberResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetCreditNoteByReferenceNumberDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetCreditNoteByReferenceNumberDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetCreditNoteByReferenceNumberResponse> {
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
        return left(
          new GetCreditNoteByReferenceNumberErrors.CreditNoteNotFoundError(
            referenceNumber
          )
        );
      }
      return right(creditNote);
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
