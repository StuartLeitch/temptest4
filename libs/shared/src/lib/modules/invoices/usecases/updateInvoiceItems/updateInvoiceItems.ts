// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { UpdateInvoiceItemsResponse } from './updateInvoiceItemsResponse';
import { UpdateInvoiceItemsErrors } from './updateInvoiceItemsErrors';
import { UpdateInvoiceItemsDTO } from './updateInvoiceItemsDTO';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';

export type UpdateInvoiceItemsContext = AuthorizationContext<Roles>;

export class UpdateInvoiceItemsUsecase
  implements
    UseCase<
      UpdateInvoiceItemsDTO,
      Promise<UpdateInvoiceItemsResponse>,
      UpdateInvoiceItemsContext
    >,
    AccessControlledUsecase<
      UpdateInvoiceItemsDTO,
      UpdateInvoiceItemsContext,
      AccessControlContext
    > {
  constructor(private invoiceItemRepo: InvoiceItemRepoContract) {}

  // @Authorize('payer:read')
  public async execute(
    request: UpdateInvoiceItemsDTO,
    context?: UpdateInvoiceItemsContext
  ): Promise<UpdateInvoiceItemsResponse> {
    try {
      request.invoiceItems.forEach(async item => {
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
        return left(new AppError.UnexpectedError(err));
      }
    }
    return right(Result.ok<void>());
  }
}
