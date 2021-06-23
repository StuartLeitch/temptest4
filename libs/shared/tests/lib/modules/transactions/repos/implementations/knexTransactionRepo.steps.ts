import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { GuardFailure } from '../../../../../../src/lib/core/logic/GuardFailure';
import { RepoError } from '../../../../../../src/lib/infrastructure/RepoError';
import { Either } from '../../../../../../src/lib/core/logic/Either';

import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { Transaction } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { TransactionMap } from './../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { TransactionId } from './../../../../../../src/lib/modules/transactions/domain/TransactionId';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockTransactionRepo } from './../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

function makeTransactionData(overwrites?: Record<string, any>): Transaction {
  const transaction = TransactionMap.toDomain({
    id: 'transaction-id-1',
    status: TransactionStatus.DRAFT,
    ...overwrites,
  });

  if (transaction.isLeft()) {
    throw transaction.value;
  }

  return transaction.value;
}

let maybeFoundTransaction: Either<GuardFailure | RepoError, Transaction>;
let mockTransactionRepo: MockTransactionRepo;
let transaction: Transaction;
let saveTransaction: Transaction;
let foundTransaction: Transaction;
let transactionExists: boolean;

Before({ tags: '@ValidateKnexTransactionRepo' }, async () => {
  mockTransactionRepo = new MockTransactionRepo();
});

Given(
  /^a transaction with the id "([\w-]+)"$/,
  async (transactionId: string) => {
    transaction = makeTransactionData({ id: transactionId });
    await mockTransactionRepo.save(transaction);
  }
);

When(
  /^we call getTransactionById for "([\w-]+)"$/,
  async (transactionId: string) => {
    const transactionIdObj = TransactionId.create(
      new UniqueEntityID(transactionId)
    );

    const maybeFoundTransaction = await mockTransactionRepo.getTransactionById(
      transactionIdObj
    );

    if (maybeFoundTransaction.isLeft()) {
      throw maybeFoundTransaction.value;
    }

    foundTransaction = maybeFoundTransaction.value;
  }
);

Then('getTransactionById returns transaction', async () => {
  expect(foundTransaction).to.equal(transaction);
});

When(
  /^we call getTransactionById for an un-existent transaction "([\w-]+)"$/,
  async (wrongTransactionId: string) => {
    const id = TransactionId.create(new UniqueEntityID(wrongTransactionId));
    maybeFoundTransaction = await mockTransactionRepo.getTransactionById(id);

    if (maybeFoundTransaction.isRight()) {
      foundTransaction = maybeFoundTransaction.value;
    }
  }
);

Then('getTransactionById returns null', async () => {
  expect(maybeFoundTransaction.isLeft()).to.equal(true);
  expect(maybeFoundTransaction.value instanceof RepoError).to.be.true;
});

When(
  /^we call delete for the transaction "([\w-]+)"$/,
  async (transactionId: string) => {
    const transactionIdObj = TransactionId.create(
      new UniqueEntityID(transactionId)
    );
    const maybeFoundTransaction = await mockTransactionRepo.getTransactionById(
      transactionIdObj
    );

    if (maybeFoundTransaction.isLeft()) {
      throw maybeFoundTransaction.value;
    }

    foundTransaction = maybeFoundTransaction.value;

    await mockTransactionRepo.delete(foundTransaction);
  }
);

Then(
  /^delete soft deletes the transaction "([\w-]+)"$/,
  async (transactionId: string) => {
    const transactionIdObj = TransactionId.create(
      new UniqueEntityID(transactionId)
    );
    const index = mockTransactionRepo.deletedItems.findIndex((item) =>
      item.id.equals(transactionIdObj.id)
    );
    expect(index).to.not.equal(-1);
  }
);

When(
  /^we call exists for ([\w-]+) transaction id$/,
  async (transactionId: string) => {
    const id = TransactionId.create(new UniqueEntityID(transactionId));
    maybeFoundTransaction = await mockTransactionRepo.getTransactionById(id);

    if (maybeFoundTransaction.isRight()) {
      foundTransaction = maybeFoundTransaction.value;
      if (!foundTransaction) {
        foundTransaction = makeTransactionData({ id: transactionId });
      }

      const maybeTransactionExists = await mockTransactionRepo.exists(
        foundTransaction
      );

      if (maybeTransactionExists.isLeft()) {
        throw maybeTransactionExists.value;
      }

      transactionExists = maybeTransactionExists.value;
    } else {
      transactionExists = false;
    }
  }
);

Then(/^Transaction.exists returns (.*)$/, async (exists: string) => {
  expect(transactionExists).to.equal(exists === 'true');
});

Given(
  /^we have an transaction object with the id "([\w-]+)"$/,
  async (transactionId: string) => {
    transaction = makeTransactionData({ id: transactionId });
  }
);

When('we call Transaction.save on the transaction object', async () => {
  const maybeSaveTransaction = await mockTransactionRepo.save(transaction);

  if (maybeSaveTransaction.isLeft()) {
    throw maybeSaveTransaction.value;
  }

  saveTransaction = maybeSaveTransaction.value;
});

Then('the transaction object should be saved', async () => {
  expect(saveTransaction).to.equal(transaction);
});
