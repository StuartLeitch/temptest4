// * Core Domain
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

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetInvoicesIdsResponse as Response } from './getInvoicesIdsResponse';
import type { GetInvoicesIdsDTO as DTO } from './getInvoicesIdsDTO';
import * as Errors from './getInvoicesIdsErrors';

export class GetInvoicesIdsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoices:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      let generator: AsyncGenerator<string, void, undefined>;
      try {
        generator = this.getInvoiceIds(request);
      } catch (err) {
        return left(new Errors.FilteringInvoicesDbError(err));
      }
      return right(generator);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async *getInvoiceIds({ omitDeleted, invoiceIds, journalIds }: DTO) {
    const items = this.invoiceRepo.getInvoicesIds(
      invoiceIds,
      journalIds,
      omitDeleted
    );
    yield* items;
  }
}
