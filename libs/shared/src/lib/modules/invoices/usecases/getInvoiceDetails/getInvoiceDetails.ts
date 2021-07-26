// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetInvoiceDetailsResponse as Response } from './getInvoiceDetailsResponse';
import type { GetInvoiceDetailsDTO as DTO } from './getInvoiceDetailsDTO';
import * as Errors from './getInvoiceDetailsErrors';

export class GetInvoiceDetailsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoice: Invoice;

    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    try {
      try {
        const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);

        if (maybeInvoice.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoice.value.message))
          );
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(new Errors.InvoiceNotFoundError(invoiceId.id.toString()));
      }

      return right(invoice);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
