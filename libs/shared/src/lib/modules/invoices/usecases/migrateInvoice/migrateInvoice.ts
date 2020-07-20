/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { Invoice } from './../../domain/Invoice';
import { InvoiceItem } from './../../domain/InvoiceItem';
import { InvoiceId } from './../../domain/InvoiceId';
// import { InvoiceMap } from './../../mappers/InvoiceMap';

import { MigrateInvoiceResponse } from './migrateInvoiceResponse';
import { MigrateInvoiceErrors } from './migrateInvoiceErrors';
import { MigrateInvoiceDTO } from './migrateInvoiceDTO';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../repos/invoiceItemRepo';

export class MigrateInvoiceUsecase
  implements
    UseCase<
      MigrateInvoiceDTO,
      Promise<MigrateInvoiceResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      MigrateInvoiceDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {}

  public async execute(
    request: MigrateInvoiceDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<MigrateInvoiceResponse> {
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;

    // * get a proper InvoiceId
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      try {
        // * System identifies invoice by id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new MigrateInvoiceErrors.InvoiceNotFound(invoiceId.id.toString())
        );
      }

      try {
        // * System identifies invoice item by invoice id
        [invoiceItem] = await this.invoiceItemRepo.getItemsByInvoiceId(
          invoiceId
        );
      } catch (err) {
        return left(
          new MigrateInvoiceErrors.InvoiceNotFound(invoiceId.id.toString())
        );
      }

      invoice.invoiceNumber = request.invoiceReference;
      invoice.dateIssued = new Date(request.dateIssued);
      invoice.dateAccepted = new Date(
        request.dateAccepted || request.dateIssued
      );

      invoiceItem.vat = request.vatValue;
      invoiceItem.price = request.APC - request.discount;

      await this.invoiceRepo.update(invoice);
      await this.invoiceItemRepo.update(invoiceItem);

      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
