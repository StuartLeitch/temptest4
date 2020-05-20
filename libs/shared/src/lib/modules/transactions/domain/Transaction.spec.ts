import { Result } from '../../../core/logic/Result';

import { Transaction, TransactionStatus } from './Transaction';
// import {TransactionAmount} from './TransactionAmount';
// import {ArticleId} from '../../articles/domain/ArticleId';

let transactionOrError: Result<Transaction>;
let transaction: Transaction;

describe('Transaction', () => {
  beforeEach(() => {
    transactionOrError = {} as Result<Transaction>;
    transaction = {} as Transaction;
  });

  it('Should be able to be created w/o amount', () => {
    transactionOrError = Transaction.create({
      // articleId: ArticleId.create(),
      status: TransactionStatus.DRAFT,
      // dateAdded: new Date(),
      dateUpdated: new Date(),
    });

    expect(transactionOrError.isSuccess).toBeTruthy();
    transaction = transactionOrError.getValue();
    expect(transaction).toBeDefined();
  });

  it('Should be able to set amount', () => {
    // const amount = 100;
    transactionOrError = Transaction.create({
      status: TransactionStatus.DRAFT,
    });
    transaction = transactionOrError.getValue();

    // Add amount
    // transaction.amount = TransactionAmount.create(amount).getValue();
    // expect(transaction.amount.value).toBe(amount);
  });

  // it('Should be able to add splits to a transaction', () => {
  //   transactionOrError = Transaction.create({
  //     totalAmount: 100
  //   });
  //   transaction = transactionOrError.getValue();

  // Add several products
  // transaction.addGenre(Genre.create('Post-punk').getValue());
  // transaction.addGenre(Genre.create('New wave').getValue());
  // transaction.addGenre(Genre.create('No wave').getValue());

  // expect(transaction.genres.length).toBe(3);
  // });
});
