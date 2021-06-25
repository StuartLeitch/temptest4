// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';
// * Usecase specifics

import { GetRecentInvoicesResponse as Response } from './getRecentInvoicesResponse';
import type { GetRecentInvoicesDTO as DTO } from './getRecentInvoicesDTO';

export class GetRecentInvoicesUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoices:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
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
