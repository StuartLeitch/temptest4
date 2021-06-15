import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { Transaction } from '../domain/Transaction';

export class TransactionMap extends Mapper<Transaction> {
  public static toDomain(raw: any): Either<GuardFailure, Transaction> {
    const maybeTransaction = Transaction.create(
      {
        status: raw.status,
        dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : new Date(),
        dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : new Date(),
      },
      new UniqueEntityID(raw.id)
    );

    return maybeTransaction;
  }

  public static toPersistence(transaction: Transaction): any {
    return {
      id: transaction.id.toString(),
      status: transaction.status,
      dateCreated: transaction.dateCreated,
      dateUpdated: transaction.dateUpdated,
    };
  }
}
