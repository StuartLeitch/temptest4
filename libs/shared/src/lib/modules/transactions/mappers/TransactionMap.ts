import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Transaction} from '../domain/Transaction';
import {STATUS as TransactionStatus} from '../domain/Transaction';

// import {ArticleId} from '../../articles/domain/ArticleId';

export class TransactionPersistenceDTO {
  id: string;
  // articleId: string;
  status: TransactionStatus;
  // amount: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export class TransactionMap extends Mapper<Transaction> {
  public static toDomain(raw: TransactionPersistenceDTO): Transaction {
    const transactionOrError = Transaction.create(
      {
        // articleId: ArticleId.create(new UniqueEntityID(raw.articleId)),
        // amount: Amount.create(raw.amount).getValue(),
        status: raw.status,
        dateCreated: new Date(raw.dateCreated),
        dateUpdated: new Date(raw.dateUpdated)
      },
      new UniqueEntityID(raw.id)
    );

    transactionOrError.isFailure ? console.log(transactionOrError) : '';

    return transactionOrError.isSuccess ? transactionOrError.getValue() : null;
  }

  public static toPersistence(
    transaction: Transaction
  ): TransactionPersistenceDTO {
    return {
      id: transaction.id.toString(),
      // articleId: transaction.articleId.toString(),
      status: transaction.status,
      // amount: transaction.amount.value,
      dateCreated: transaction.dateCreated,
      dateUpdated: transaction.dateUpdated
    };
  }
}
