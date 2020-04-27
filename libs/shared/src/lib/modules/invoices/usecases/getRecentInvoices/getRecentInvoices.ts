// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

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
    // TODO: add proper DDD types to the paginated result
    try {
      const paginatedResult = await this.invoiceRepo.getRecentInvoices(request);
      return right(Result.ok<any>(paginatedResult));
    } catch (err) {
      return left(
        new AppError.UnexpectedError(err, 'Getting recent invoices failed')
      );
    }
  }
}
