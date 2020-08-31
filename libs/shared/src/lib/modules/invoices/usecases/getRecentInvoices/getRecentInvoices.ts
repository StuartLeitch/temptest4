/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specifics
import { GetRecentInvoicesResponse } from './getRecentInvoicesResponse';
import type { GetRecentInvoicesDTO } from './getRecentInvoicesDTO';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

export class GetRecentInvoicesUsecase
  implements
    UseCase<
      GetRecentInvoicesDTO,
      Promise<GetRecentInvoicesResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetRecentInvoicesDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetRecentInvoicesDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetRecentInvoicesResponse> {
    // TODO: add proper DDD types to the paginated result
    try {
      const paginatedResult = await this.invoiceRepo.getRecentInvoices(request);
      return right(Result.ok<any>(paginatedResult));
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting recent invoices failed'));
    }
  }
}
