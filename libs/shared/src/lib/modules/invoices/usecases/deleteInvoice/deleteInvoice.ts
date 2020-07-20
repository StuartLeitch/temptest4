/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

export interface DeleteInvoiceRequestDTO {
  invoiceId: string;
}

export class DeleteInvoiceUsecase
  implements
    UseCase<
      DeleteInvoiceRequestDTO,
      Result<unknown>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      DeleteInvoiceRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private invoiceRepo: InvoiceRepoContract;

  constructor(invoiceRepo: InvoiceRepoContract) {
    this.invoiceRepo = invoiceRepo;
  }

  private async getInvoice(
    request: DeleteInvoiceRequestDTO
  ): Promise<Result<Invoice>> {
    const { invoiceId } = request;

    if (!invoiceId) {
      return Result.fail<Invoice>(`Invalid invoice id=${invoiceId}`);
    }

    const invoice = await this.invoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    const found = !!invoice;

    if (found) {
      return Result.ok<Invoice>(invoice);
    } else {
      return Result.fail<Invoice>(`Couldn't find invoice by id=${invoiceId}`);
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:delete')
  public async execute(
    request: DeleteInvoiceRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Result<unknown>> {
    try {
      // * System looks-up the invoice
      const invoiceOrError = await this.getInvoice(request);

      if (invoiceOrError.isFailure) {
        return Result.fail<Invoice>(invoiceOrError.error);
      }

      const invoice = invoiceOrError.getValue();

      // * This is where all the magic happens
      await this.invoiceRepo.delete(invoice);

      return Result.ok<Invoice>(null);
    } catch (err) {
      console.log(err);
      return Result.fail<Invoice>(err);
    }
  }
}
