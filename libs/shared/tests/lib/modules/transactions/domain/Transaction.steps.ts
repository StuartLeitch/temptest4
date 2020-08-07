import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { Transaction, TransactionStatus } from '../../../../../src/lib/modules/transactions/domain/Transaction';
import { Result } from './../../../../../src/lib/core/logic/Result';
import { InvoiceMap } from '../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';

let transactionOrError: Result<Transaction>;
let transaction: Transaction;

Before(function() {
  transactionOrError = {} as Result<Transaction>;
  transaction = {} as Transaction;
})

Given('There is a Transaction Domain Entity', function() {
  return;
});

When('The Transaction.create method is called', function() {
  transactionOrError = Transaction.create({
    status: TransactionStatus.DRAFT,
    dateUpdated: new Date(),
  });
});

When(/^I try to add an Invoice with ID = "([\w-]+)" to that Transaction$/, function(
  testInvoiceId: string
) {
  const invoice = InvoiceMap.toDomain({
    id: testInvoiceId,
    status: 'DRAFT',
  });

  transaction = Transaction.create({
    status: TransactionStatus.DRAFT
  }).getValue();

  transaction.addInvoice(invoice);
});

When('I try to change the Transaction status to ACTIVE', function() {
  transaction = Transaction.create({
    status: TransactionStatus.DRAFT
  }).getValue();

  transaction.markAsActive();
});

When('I try to change the Transaction status to FINAL', function() {
  transaction = Transaction.create({
    status: TransactionStatus.DRAFT
  }).getValue();

  transaction.markAsFinal();
});

Then('A new DRAFT Transaction is successfully created', function() {
  expect(transactionOrError.isSuccess).to.equal(true);
  transaction = transactionOrError.getValue();
  expect(transaction.status).to.equal(TransactionStatus.DRAFT);
});

Then(/^The Invoice with id "([\w-]+)" is successfully added to the Transaction$/, function(
  testInvoiceId: string
) {
  expect(transaction.totalNumInvoices).to.equal(1);
  expect(transaction.invoices.currentItems[0].id.toValue()).to.equal(testInvoiceId);
});

Then(/^The Transaction status is changed to (.+)/, function(
  status: string
){
  expect(transaction.status).to.equal(status);
});
