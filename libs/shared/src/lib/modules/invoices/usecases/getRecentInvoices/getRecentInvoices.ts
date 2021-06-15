// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specifics
import { GetRecentInvoicesResponse } from './getRecentInvoicesResponse';
import type { GetRecentInvoicesDTO } from './getRecentInvoicesDTO';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

export class GetRecentInvoicesUsecase
  implements
    UseCase<GetRecentInvoicesDTO, Promise<GetRecentInvoicesResponse>, Context>,
    AccessControlledUsecase<
      GetRecentInvoicesDTO,
      Context,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetRecentInvoicesDTO,
    context?: Context
  ): Promise<GetRecentInvoicesResponse> {
    // TODO: add proper DDD types to the paginated result
    try {
      const maybePaginatedResult = await this.invoiceRepo.getRecentInvoices(
        request
      );

      if (maybePaginatedResult.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePaginatedResult.value.message))
        );
      }

      return right(maybePaginatedResult.value);
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting recent invoices failed'));
    }
  }
}
