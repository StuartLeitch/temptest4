/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteByInvoiceIdResponse as Response } from './getCreditNoteByInvoiceIdResponse';
import * as Errors from './getCreditNoteByInvoiceIdErrors';
import type { GetCreditNoteByInvoiceIdDTO as DTO } from './getCreditNoteByInvoiceIdDTO';

// to be modified with Guard/Either
export class GetCreditNoteByInvoiceIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {
    super();
  }

  @Authorize('creditNote:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { invoiceId } = request;

    let creditNote: CreditNote;

    try {
      try {
        // * System identifies credit note by invoice id
        const maybeCreditNote = await this.creditNoteRepo.getCreditNoteByInvoiceId(
          InvoiceId.create(new UniqueEntityID(invoiceId))
        );
        if (maybeCreditNote.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeCreditNote.value.message))
          );
        }
        creditNote = maybeCreditNote.value;
      } catch (e) {
        return left(new Errors.CreditNoteNotFoundError(invoiceId));
      }

      return right(creditNote);
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
