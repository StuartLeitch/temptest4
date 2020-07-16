// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';

import { Transaction } from '../../domain/Transaction';
import { TransactionRepoContract } from '../../repos/transactionRepo';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

export interface SearchTransactionsRequestDTO {
  params: string[];
}

export class SearchTransactions
  implements
    UseCase<
      SearchTransactionsRequestDTO,
      Result<Transaction[]>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      SearchTransactionsRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private transactionRepo: TransactionRepoContract;

  constructor(transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async searchTransactions(
    params: string[]
  ): Promise<Result<Transaction[]>> {
    // const transactions = await this.transactionRepo.getTransactionCollection(
    //   params
    // );
    //
    // TODO implement this when we know what params looks like
    const transactions = [];

    if (!transactions) {
      return Result.fail<Transaction[]>(
        `Couldn't find transaction(s) matching ${params}`
      );
    }

    return Result.ok<Transaction[]>(transactions);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:search')
  public async execute(
    request: SearchTransactionsRequestDTO
  ): Promise<Result<Transaction[]>> {
    const { params } = request;

    try {
      // * System searches for transactions matching query params
      const transactionsOrError = await this.searchTransactions(params);
      if (transactionsOrError.isFailure) {
        return Result.fail<Transaction[]>(transactionsOrError.error);
      }
      const transactions = transactionsOrError.getValue();

      // magic happens here
      return Result.ok<Transaction[]>(transactions);
    } catch (err) {
      return Result.fail<Transaction[]>(err);
    }
  }
}
