import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { GuardFailure } from './../../../../../src/lib/core/logic/GuardFailure';
import { Either } from './../../../../../src/lib/core/logic/Either';

import {
  TransactionStatus,
  Transaction,
} from '../../../../../src/lib/modules/transactions/domain/Transaction';

import { InvoiceMap } from '../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

let transactionOrError: Either<GuardFailure, Transaction>;
let transaction: Transaction;

Before({ tags: '@ValidateTransaction' }, function () {
  transactionOrError = null;
  transaction = null;
});

Given('There is a Transaction Domain Entity', function () {
  return;
});

When('The Transaction.create method is called', function () {
  transactionOrError = Transaction.create({
    status: TransactionStatus.DRAFT,
    dateUpdated: new Date(),
  });
});

When(
  /^I try to add an Invoice with ID = "([\w-]+)" to that Transaction$/,
  function (testInvoiceId: string) {
    const invoice = InvoiceMap.toDomain({
      id: testInvoiceId,
      status: 'DRAFT',
    });

    if (invoice.isLeft()) {
      throw invoice.value;
    }

    const maybeTransaction = Transaction.create({
      status: TransactionStatus.DRAFT,
    });

    if (maybeTransaction.isLeft()) {
      throw maybeTransaction.value;
    }

    transaction = maybeTransaction.value;

    transaction.addInvoice(invoice.value);
  }
);

When('I try to change the Transaction status to ACTIVE', function () {
  const maybeTransaction = Transaction.create({
    status: TransactionStatus.DRAFT,
  });

  if (maybeTransaction.isLeft()) {
    throw maybeTransaction.value;
  }

  transaction = maybeTransaction.value;

  transaction.markAsActive();
});

When('I try to change the Transaction status to FINAL', function () {
  const maybeTransaction = Transaction.create({
    status: TransactionStatus.DRAFT,
  });

  if (maybeTransaction.isLeft()) {
    throw maybeTransaction.value;
  }

  transaction = maybeTransaction.value;

  transaction.markAsFinal();
});

Then('A new DRAFT Transaction is successfully created', function () {
  expect(transactionOrError.isRight()).to.equal(true);

  if (transactionOrError.isLeft()) {
    throw transactionOrError.value;
  }

  transaction = transactionOrError.value;
  expect(transaction.status).to.equal(TransactionStatus.DRAFT);
});

Then(
  /^The Invoice with id "([\w-]+)" is successfully added to the Transaction$/,
  function (testInvoiceId: string) {
    expect(transaction.totalNumInvoices).to.equal(1);
    expect(transaction.invoices.currentItems[0].id.toValue()).to.equal(
      testInvoiceId
    );
  }
);

Then(/^The Transaction status is changed to (.+)/, function (status: string) {
  expect(transaction.status).to.equal(status);
});
