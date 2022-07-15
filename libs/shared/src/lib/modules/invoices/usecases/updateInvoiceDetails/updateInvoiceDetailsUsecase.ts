// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlledUsecase, AccessControlContext, Authorize } from '../../../../domain/authorization';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { UpdateInvoiceDetailsReponse as Response } from './updateInvoiceDetailsResponse';
import type { UpdateInvoiceDetailsDTO as DTO } from './updateInvoiceDetailsDTO';
import * as Errors from './updateInvoiceDetailsErrors';

export class UpdateInvoiceDetailsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoice:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUpdate = await this.invoiceRepo.update(request.invoice);

      if (maybeUpdate.isLeft()) {
        return left(new Errors.InvoiceNotUpdated(request.invoice.invoiceId.id.toString()));
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
