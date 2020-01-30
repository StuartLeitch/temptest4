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
  constructor(private invoiceRepo: InvoiceRepoContract, private _context) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  get filters() {
    return this._context.filters;
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetRecentInvoicesDTO,
    context?: GetRecentInvoicesAuthenticationContext
  ): Promise<GetRecentInvoicesResponse> {
    // TODO: add proper DDD types to the paginated result
    let paginatedResult: any;

    try {
      try {
        paginatedResult = await this.invoiceRepo.getRecentInvoices(request, this.filters);
      } catch (err) {
        return left(
          new AppError.UnexpectedError(
            new Error('Getting recent invoices failed.')
          )
        );
      }
      return right(Result.ok<any>(paginatedResult));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
