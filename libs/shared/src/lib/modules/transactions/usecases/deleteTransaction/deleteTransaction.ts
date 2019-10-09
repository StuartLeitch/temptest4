// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Transaction} from '../../domain/Transaction';
import {TransactionId} from '../../domain/TransactionId';
import {TransactionRepoContract} from '../../repos/transactionRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface DeleteTransactionRequestDTO {
  transactionId: string;
}

export type DeleteTransactionContext = AuthorizationContext<Roles>;

export class DeleteTransactionUsecase
  implements
    UseCase<
      DeleteTransactionRequestDTO,
      Result<unknown>,
      DeleteTransactionContext
    >,
    AccessControlledUsecase<
      DeleteTransactionRequestDTO,
      DeleteTransactionContext,
      AccessControlContext
    > {
  private transactionRepo: TransactionRepoContract;

  constructor(transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async getTransaction(
    request: DeleteTransactionRequestDTO
  ): Promise<Result<Transaction>> {
    const {transactionId} = request;
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
    context?: DeleteTransactionContext
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
