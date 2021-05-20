// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left, right, Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { InvoiceId, } from '../../../invoices/domain/InvoiceId';
import { Transaction } from '../../domain/Transaction';
import { TransactionRepoContract } from '../../repos/transactionRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { GetTransactionByInvoiceIdRequestDTO } from './getTransactionByInvoiceIdDTO';
import { GetTransactionByInvoiceIdResponse as Response } from './getTransactionByInvoiceIdResponse';
import * as Errors from './getTransactionByInvoiceIdErrors';

export class GetTransactionByInvoiceIdUsecase
  implements
    UseCase<
      GetTransactionByInvoiceIdRequestDTO,
      Promise<Response>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetTransactionByInvoiceIdRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:read')
  public async execute(
    request: GetTransactionByInvoiceIdRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    const { invoiceId } = request;

    if (!invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    let transaction: Transaction;

    try {
      try {
        // * System identifies invoice by cancelled Invoice reference
        transaction = await this.transactionRepo.getTransactionByInvoiceId(
          InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
        );
      } catch (e) {
        return left(
          new Errors.TransactionNotFoundError(invoiceId)
        );
      }
      return right(transaction);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
