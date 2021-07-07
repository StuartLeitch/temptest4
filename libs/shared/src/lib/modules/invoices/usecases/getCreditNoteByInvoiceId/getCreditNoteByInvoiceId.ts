// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
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

import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetCreditNoteByInvoiceIdResponse as Response } from './getCreditNoteByInvoiceIdResponse';
import { GetCreditNoteByInvoiceIdDTO as DTO } from './getCreditNoteByInvoiceIdDTO';
import * as Errors from './getCreditNoteByInvoiceIdErrors';

export class GetCreditNoteByInvoiceIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('creditNote:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { invoiceId } = request;

    let creditNote: Invoice;

    try {
      try {
        // * System identifies invoice by cancelled Invoice reference
        const maybeCreditNote = await this.invoiceRepo.findByCancelledInvoiceReference(
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
      return left(new UnexpectedError(err));
    }
  }
}
