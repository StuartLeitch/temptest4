import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Transaction } from '../domain/Transaction';

export class TransactionMap extends Mapper<Transaction> {
  public static toDomain(raw: any): Transaction {
    const transactionOrError = Transaction.create(
      {
        deleted: raw.deleted,
        status: raw.status,
        dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : new Date(),
        dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : new Date()
      },
      new UniqueEntityID(raw.id)
    );

    transactionOrError.isFailure ? console.log(transactionOrError) : '';

    return transactionOrError.isSuccess ? transactionOrError.getValue() : null;
  }

  public static toPersistence(transaction: Transaction): any {
    return {
      id: transaction.id.toString(),
      status: transaction.status,
      dateCreated: transaction.dateCreated,
      dateUpdated: transaction.dateUpdated
    };
  }
}
