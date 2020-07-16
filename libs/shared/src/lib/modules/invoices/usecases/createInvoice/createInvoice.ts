/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { Transaction } from '../../../transactions/domain/Transaction';
import { TransactionId } from '../../../transactions/domain/TransactionId';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';
import { CreateInvoiceRequestDTO } from './createInvoiceDTO';
import { CreateInvoiceResponse } from './createInvoiceResponse';
import { CreateInvoiceErrors } from './createInvoiceErrors';

export class CreateInvoiceUsecase
  implements
    UseCase<
      CreateInvoiceRequestDTO,
      Promise<CreateInvoiceResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateInvoiceRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private transactionRepo: TransactionRepoContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.transactionRepo = transactionRepo;
  }

  private async getAccessControlContext(
    request: CreateInvoiceRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:invoice')
  public async execute(
    request: CreateInvoiceRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateInvoiceResponse> {
    let transaction: Transaction;

    // * build the TransactionId
    const transactionId = TransactionId.create(
      new UniqueEntityID(request.transactionId)
    );

    try {
      try {
        // * System identifies transaction by Id
        transaction = await this.transactionRepo.getTransactionById(
          transactionId
        );
      } catch (err) {
        return left(
          new CreateInvoiceErrors.TransactionNotFoundError(
            request.transactionId
          )
        );
      }

      const invoiceProps = {
        status: InvoiceStatus.DRAFT,
      } as any; // TODO: should reference the real invoice props, as in its domain
      if (transactionId) {
        invoiceProps.transactionId = transactionId;
      }

      // * System creates DRAFT invoice
      const invoiceOrError = Invoice.create(invoiceProps);

      // This is where all the magic happens
      const invoice = invoiceOrError.getValue();
      await this.invoiceRepo.save(invoice);

      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
