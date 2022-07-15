// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlledUsecase, AccessControlContext, Authorize } from '../../../../domain/authorization';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { UpdateInvoiceDateAcceptedResponse as Response } from './updateInvoiceDateAcceptedResponse';
import type { UpdateInvoiceDateAcceptedDTO as DTO } from './updateInvoiceDateAcceptedDTO';
import * as Errors from './updateInvoiceDateAcceptedErrors';

export class UpdateInvoiceDateAcceptedUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoice:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const { invoiceId, dateAccepted } = request;
      const newDateAccepted = dateAccepted ? new Date(dateAccepted) : new Date();
      const maybeUpdate = await this.invoiceRepo.updateAcceptedDate(invoiceId, newDateAccepted);

      if (maybeUpdate.isLeft()) {
        return left(new Errors.InvoiceDateAcceptedUpdateError(request.invoiceId.id.toString()));
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
