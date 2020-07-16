// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Transaction } from '../../domain/Transaction';
import { TransactionId } from '../../domain/TransactionId';
import { TransactionRepoContract } from '../../repos/transactionRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

export interface GetTransactionRequestDTO {
  transactionId?: string;
}

export class GetTransactionUsecase
  implements
    UseCase<
      GetTransactionRequestDTO,
      Result<Transaction>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetTransactionRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async getTransaction(
    request: GetTransactionRequestDTO
  ): Promise<Result<Transaction>> {
    const { transactionId } = request;

    if (!transactionId) {
      return Result.fail<Transaction>(
        `Invalid Transaction id=${transactionId}`
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
        `Couldn't find transaction by id=${transactionId}`
      );
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:read')
  public async execute(
    request: GetTransactionRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Result<Transaction>> {
    // if ('transactionId' in request) {
    //   const transactionOrError = await this.getTransaction(request);
    //   if (transactionOrError.isFailure) {
    //     return Result.fail<Invoice>(transactionOrError.error);
    //   }
    //   transactionId = TransactionId.create(
    //     new UniqueEntityID(rawTransactionId)
    //   );
    // }

    try {
      // * System looks-up the transaction
      const transactionOrError = await this.getTransaction(request);

      if (transactionOrError.isFailure) {
        return Result.fail<Transaction>(transactionOrError.error);
      }

      const transaction = transactionOrError.getValue();

      // * This is where all the magic happens
      return Result.ok<Transaction>(transaction);
    } catch (err) {
      console.log(err);
      return Result.fail<Transaction>(err);
    }
  }
}
