// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';

import {Transaction} from '../../domain/Transaction';
import {TransactionRepoContract} from '../../repos/transactionRepo';

export class GetTransactionsUsecase
  implements UseCase<{}, Result<Transaction[]>> {
  private transactionRepo: TransactionRepoContract;

  constructor(transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async getTransactions(): Promise<Result<Transaction[]>> {
    const transactions = await this.transactionRepo.getTransactionCollection();

    if (!transactions) {
      return Result.fail<Transaction[]>(`Couldn't list transactions.`);
    }

    return Result.ok<Transaction[]>(transactions);
  }

  public async execute(request: {}): Promise<Result<Transaction[]>> {
    try {
      // * System searches for transactions matching query params
      const transactionsOrError = await this.getTransactions();
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
