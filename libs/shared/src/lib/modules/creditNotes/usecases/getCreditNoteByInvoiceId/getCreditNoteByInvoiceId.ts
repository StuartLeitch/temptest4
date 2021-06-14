/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteByInvoiceIdResponse } from './getCreditNoteByInvoiceIdResponse';
import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { GetCreditNoteByInvoiceIdDTO } from './getCreditNoteByInvoiceIdDTO';

// to be modified with Guard/Either
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
    private creditNoteRepo: CreditNoteRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetCreditNoteByInvoiceIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetCreditNoteByInvoiceIdResponse> {
    const { invoiceId } = request;

    let creditNote: CreditNote;

    try {
      try {
        // * System identifies credit note by invoice id
        creditNote = await this.creditNoteRepo.getCreditNoteByInvoiceId(
          InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
        );
      } catch (e) {
        return left(
          new GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError(invoiceId)
        );
      }

      return right(Result.ok<CreditNote>(creditNote));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
