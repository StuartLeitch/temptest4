// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { InvoiceStatus, Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { ChangeInvoiceStatusResponse as Response } from './changeInvoiceStatusResponse';
import type { ChangeInvoiceStatusRequestDTO as DTO } from './changeInvoiceStatusDTO';
import * as Errors from './changeInvoiceStatusErrors';

export class ChangeInvoiceStatus
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoice:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoice: Invoice;
    try {
      try {
        const invoiceId = InvoiceId.create(
          new UniqueEntityID(request.invoiceId)
        );

        const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);

        if (maybeInvoice.isLeft()) {
          return left(new Errors.InvoiceNotFoundError(request.invoiceId));
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      try {
        invoice.status = InvoiceStatus[request.status];
        if (invoice.status === InvoiceStatus.ACTIVE) {
          invoice.dateIssued = new Date();
        }
        await this.invoiceRepo.update(invoice);
      } catch (err) {
        return left(new Errors.ChangeStatusError(request.invoiceId));
      }

      return right(invoice);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
