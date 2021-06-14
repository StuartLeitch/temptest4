/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

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
      // * System identifies credit note by  invoice reference number
      creditNote = await this.creditNoteRepo.getCreditNoteByReferenceNumber(
        referenceNumber
      );
      return right(Result.ok<CreditNote>(creditNote));
    } catch (err) {
      return left(
        new GetCreditNoteByReferenceNumberErrors.CreditNoteNotFoundError(
          referenceNumber
        )
      );
    }
  }
}
