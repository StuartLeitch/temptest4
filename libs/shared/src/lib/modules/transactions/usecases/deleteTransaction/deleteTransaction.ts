/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Transaction } from '../../domain/Transaction';
import { TransactionId } from '../../domain/TransactionId';
import { TransactionRepoContract } from '../../repos/transactionRepo';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

export interface DeleteTransactionRequestDTO {
  transactionId: string;
}

export class DeleteTransactionUsecase
  implements
    UseCase<
      DeleteTransactionRequestDTO,
      Result<unknown>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      DeleteTransactionRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private transactionRepo: TransactionRepoContract;

  constructor(transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async getTransaction(
    request: DeleteTransactionRequestDTO
  ): Promise<Result<Transaction>> {
    const { transactionId } = request;
    if (!transactionId) {
      return Result.fail<Transaction>(
        `Invalid Transaction ID=${transactionId}`
      );
    }

    const transaction = await this.transactionRepo.getTransactionById(
      TransactionId.create(new UniqueEntityID(transactionId))
    );
    const found = !!transaction;

    if (found) {
      return Result.ok<Transaction>(transaction);
    } else {
      return Result.fail<Transaction>(
        `Couldn't find Transaction by id=${transactionId}`
      );
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:delete')
  public async execute(
    request: DeleteTransactionRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Result<unknown>> {
    try {
      // * System deletes transaction
      const transactionOrError = await this.getTransaction(request);

      if (transactionOrError.isFailure) {
        return Result.fail<Transaction>(transactionOrError.error);
      }

      // This is where all the magic happens
      const transaction = transactionOrError.getValue();
      await this.transactionRepo.delete(transaction);

      return Result.ok<Transaction>(null);
    } catch (err) {
      console.log(err);
      return Result.fail<Transaction>(err);
    }
  }
}
