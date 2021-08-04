// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../..//core/logic/AppError';
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

import { DeleteInvoiceResponse as Response } from './deleteInvoiceResponse';
import type { DeleteInvoiceRequestDTO as DTO } from './deleteInvoiceDTO';
import * as Errors from './deleteInvoiceErrors';

export class DeleteInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    super();
  }

  @Authorize('invoice:delete')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      // * System looks-up the invoice
      const maybeInvoice = await this.getInvoice(request);

      if (maybeInvoice.isLeft()) {
        return maybeInvoice.map(() => null);
      }

      const invoice = maybeInvoice.value;
      // * This is where all the magic happens
      await this.invoiceRepo.delete(invoice);
      invoice.generateInvoiceDraftDeletedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(null);
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }

  private async getInvoice(
    request: DTO
  ): Promise<
    Either<
      Errors.InvoiceIdRequiredError | Errors.InvoiceNotExistsError,
      Invoice
    >
  > {
    const { invoiceId } = request;

    if (!invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    const invoiceIdEntity = InvoiceId.create(new UniqueEntityID(invoiceId));

    const invoice = await this.invoiceRepo.getInvoiceById(invoiceIdEntity);

    if (invoice.isLeft()) {
      return left(new Errors.InvoiceNotExistsError(invoiceId));
    }
    {
      return right(invoice.value);
    }
  }
}
