/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetCreditNoteByInvoiceIdResponse } from './getCreditNoteByInvoiceIdResponse';
import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { GetCreditNoteByInvoiceIdDTO } from './getCreditNoteByInvoiceIdDTO';

export class GetCreditNoteByInvoiceIdUsecase
  implements
    UseCase<
      GetCreditNoteByInvoiceIdDTO,
      Promise<GetCreditNoteByInvoiceIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetCreditNoteByInvoiceIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    // private articleRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetCreditNoteByInvoiceIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetCreditNoteByInvoiceIdResponse> {
    const { invoiceId } = request;

    let creditNote: Invoice;

    try {
      try {
        // * System identifies invoice by cancelled Invoice reference
        creditNote = await this.invoiceRepo.findByCancelledInvoiceReference(
          InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
        );
      } catch (e) {
        return left(
          new GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError(invoiceId)
        );
      }

      return right(Result.ok<Invoice>(creditNote));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
