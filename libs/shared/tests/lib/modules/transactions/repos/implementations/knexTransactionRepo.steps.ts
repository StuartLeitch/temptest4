import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { Transaction } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { TransactionMap } from './../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { TransactionId } from './../../../../../../src/lib/modules/transactions/domain/TransactionId';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockTransactionRepo } from './../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

function makeTransactionData(overwrites?: Record<string, any>): Transaction {
  return TransactionMap.toDomain({
    id: 'transaction-id-1',
    status: TransactionStatus.DRAFT,
    ...overwrites,
  });
}

let mockTransactionRepo: MockTransactionRepo;
let transaction: Transaction;
let saveTransaction: Transaction;
let foundTransaction: Transaction;
let transactionExists: boolean;

Before(async () => {
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
    foundTransaction = await mockTransactionRepo.getTransactionById(
      transactionIdObj
    );
  }
);

Then('getTransactionById returns transaction', async () => {
  expect(foundTransaction).to.equal(transaction);
});

When(
  /^we call getTransactionById for an un-existent transaction "([\w-]+)"$/,
  async (wrongTransactionId: string) => {
    const id = TransactionId.create(new UniqueEntityID(wrongTransactionId));
    foundTransaction = await mockTransactionRepo.getTransactionById(id);
  }
);

Then('getTransactionById returns null', async () => {
  expect(foundTransaction).to.equal(null);
});

When(
  /^we call delete for the transaction "([\w-]+)"$/,
  async (transactionId: string) => {
    const transactionIdObj = TransactionId.create(
      new UniqueEntityID(transactionId)
    );
    foundTransaction = await mockTransactionRepo.getTransactionById(
      transactionIdObj
    );
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
    foundTransaction = await mockTransactionRepo.getTransactionById(id);
    if (!foundTransaction) {
      foundTransaction = await makeTransactionData({ id: transactionId });
    }
    transactionExists = await mockTransactionRepo.exists(foundTransaction);
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
  saveTransaction = await mockTransactionRepo.save(transaction);
});

Then('the transaction object should be saved', async () => {
  expect(saveTransaction).to.equal(transaction);
});
