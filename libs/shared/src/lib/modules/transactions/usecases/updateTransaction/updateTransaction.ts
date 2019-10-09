// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Transaction} from '../../domain/Transaction';
import {TransactionAmount} from '../../domain/TransactionAmount';
import {TransactionId} from '../../domain/TransactionId';
import {TransactionRepoContract} from '../../repos/transactionRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface UpdateTransactionRequestDTO {
  transactionId?: string;
  amount?: number;
}

export type UpdateTransactionContext = AuthorizationContext<Roles>;

export class UpdateTransactionUsecase
  implements
    UseCase<
      UpdateTransactionRequestDTO,
      Result<Transaction>,
      UpdateTransactionContext
    >,
    AccessControlledUsecase<
      UpdateTransactionRequestDTO,
      UpdateTransactionContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract // private transactionRepo: TransactionRepoContract
  ) {
    this.transactionRepo = transactionRepo;
  }

  private async getTransaction(
    request: UpdateTransactionRequestDTO
  ): Promise<Result<Transaction>> {
    const {transactionId} = request;

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

  @Authorize('transaction:update')
  public async execute(
    request: UpdateTransactionRequestDTO,
    context?: UpdateTransactionContext
  ): Promise<Result<Transaction>> {
    try {
      // * System looks-up the transaction
      const transactionOrError = await this.getTransaction(request);

      if (transactionOrError.isFailure) {
        return Result.fail<Transaction>(transactionOrError.error);
      }

      // * System retrieves transaction details
      const transaction = transactionOrError.getValue();

      // * This is where all the magic happens
      const {amount: rawAmount} = request;

      if (rawAmount) {
        const amount = TransactionAmount.create(rawAmount).getValue();
        // transaction.amount = amount;
      }

      await this.transactionRepo.update(transaction);

      return Result.ok<Transaction>(transaction);
    } catch (err) {
      console.log(err);
      return Result.fail<Transaction>(err);
    }
  }
}
