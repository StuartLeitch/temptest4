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

export interface SoftDeleteDraftTransactionRequestDTO {
  manuscriptId: string;
}

export type DeleteTransactionContext = AuthorizationContext<Roles>;

export class SoftDeleteDraftTransactionUsecase
  implements
    UseCase<
      SoftDeleteDraftTransactionRequestDTO,
      Result<unknown>,
      DeleteTransactionContext
    >,
    AccessControlledUsecase<
      SoftDeleteDraftTransactionRequestDTO,
      DeleteTransactionContext,
      AccessControlContext
    > {
  constructor(private transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  // private async getTransactionByManuscriptId(
  //   request: SoftDeleteDraftTransactionRequestDTO
  // ): Promise<Result<Transaction>> {
  //   const {manuscriptId} = request;

  //   if (!transactionId) {
  //     return Result.fail<Transaction>(
  //       `Invalid Transaction ID=${transactionId}`
  //     );
  //   }

  //   const transaction = await this.transactionRepo.getTransactionById(
  //     TransactionId.create(new UniqueEntityID(transactionId))
  //   );
  //   const found = !!transaction;

  //   if (found) {
  //     return Result.ok<Transaction>(transaction);
  //   } else {
  //     return Result.fail<Transaction>(
  //       `Couldn't find Transaction by id=${transactionId}`
  //     );
  //   }
  // }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:delete')
  public async execute(
    request: SoftDeleteDraftTransactionRequestDTO,
    context?: DeleteTransactionContext
  ): Promise<Result<unknown>> {
    try {
      // * System identifies transaction by manuscript ID
      // const transactionOrError = await this.getTransactionByManuscriptId(
      //   request
      // );

      // if (transactionOrError.isFailure) {
      //   return Result.fail<Transaction>(transactionOrError.error);
      // }

      // // This is where all the magic happens
      // const transaction = transactionOrError.getValue();
      // // * System soft deletes transaction
      // await this.transactionRepo.delete(transaction);

      return Result.ok<Transaction>(null);
    } catch (err) {
      console.log(err);
      return Result.fail<Transaction>(err);
    }
  }
}
