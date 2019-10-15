import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Transaction} from '../domain/Transaction';

export class TransactionMap extends Mapper<Transaction> {
  public static toDomain(raw: any): Transaction {
    const transactionOrError = Transaction.create(
      {
        deleted: raw.deleted,
        status: raw.status,
        dateCreated: new Date(raw.dateCreated),
        dateUpdated: new Date(raw.dateUpdated)
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
