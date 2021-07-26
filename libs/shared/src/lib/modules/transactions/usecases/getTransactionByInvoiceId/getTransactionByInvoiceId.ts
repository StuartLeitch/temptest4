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

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Transaction } from '../../domain/Transaction';

import { TransactionRepoContract } from '../../repos/transactionRepo';

import { GetTransactionByInvoiceIdResponse as Response } from './getTransactionByInvoiceIdResponse';
import type { GetTransactionByInvoiceIdRequestDTO as DTO } from './getTransactionByInvoiceIdDTO';
import * as Errors from './getTransactionByInvoiceIdErrors';

export class GetTransactionByInvoiceIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private transactionRepo: TransactionRepoContract) {
    super();
  }

  @Authorize('transaction:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { invoiceId } = request;

    if (!invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    let transaction: Transaction;

    try {
      try {
        // * System identifies invoice by cancelled Invoice reference
        const maybeTransaction = await this.transactionRepo.getTransactionByInvoiceId(
          InvoiceId.create(new UniqueEntityID(invoiceId))
        );

        if (maybeTransaction.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeTransaction.value.message))
          );
        }

        transaction = maybeTransaction.value;
      } catch (e) {
        return left(new Errors.TransactionNotFoundError(invoiceId));
      }

      return right(transaction);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
