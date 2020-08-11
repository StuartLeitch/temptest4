// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { UpdateInvoiceItemsResponse } from './updateInvoiceItemsResponse';
import { UpdateInvoiceItemsErrors } from './updateInvoiceItemsErrors';
import { UpdateInvoiceItemsDTO } from './updateInvoiceItemsDTO';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';

export class UpdateInvoiceItemsUsecase
  implements
    UseCase<
      UpdateInvoiceItemsDTO,
      Promise<UpdateInvoiceItemsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      UpdateInvoiceItemsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private invoiceItemRepo: InvoiceItemRepoContract) {}

  // @Authorize('payer:read')
  public async execute(
    request: UpdateInvoiceItemsDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<UpdateInvoiceItemsResponse> {
    try {
      request.invoiceItems.forEach(async (item) => {
        if (!(await this.invoiceItemRepo.exists(item))) {
          throw new UpdateInvoiceItemsErrors.InvoiceItemNotFound(
            item.id.toString()
          );
        } else {
          this.invoiceItemRepo.update(item);
        }
      });
    } catch (err) {
      if (err instanceof UpdateInvoiceItemsErrors.InvoiceItemNotFound) {
        return left(err);
      } else {
        return left(new UnexpectedError(err));
      }
    }
    return right(Result.ok<void>());
  }
}
