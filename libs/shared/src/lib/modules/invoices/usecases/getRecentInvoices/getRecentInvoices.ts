// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { InvoiceCollection } from '../../domain/Invoice';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../repos/invoiceItemRepo';

// * Usecase specifics
import { GetRecentInvoicesResponse } from './getRecentInvoicesResponse';
// import { UpdateTransactionOnAcceptManuscriptErrors } from './updateTransactionOnAcceptManuscriptErrors';
import { GetRecentInvoicesDTO } from './getRecentInvoicesDTO';
// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  GetRecentInvoicesAuthenticationContext
} from './getRecentInvoicesAuthenticationContext';

export class GetRecentInvoicesUsecase
  implements
    UseCase<
      GetRecentInvoicesDTO,
      Promise<GetRecentInvoicesResponse>,
      GetRecentInvoicesAuthenticationContext
    >,
    AccessControlledUsecase<
      GetRecentInvoicesDTO,
      GetRecentInvoicesAuthenticationContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetRecentInvoicesDTO,
    context?: GetRecentInvoicesAuthenticationContext
  ): Promise<GetRecentInvoicesResponse> {
    let invoices: InvoiceCollection;

    try {
      try {
        invoices = await this.invoiceRepo.getRecentInvoices();
      } catch (err) {
        return left(new AppError.UnexpectedError(new Error('boom')));
      }
      return right(Result.ok<any[]>(invoices));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
