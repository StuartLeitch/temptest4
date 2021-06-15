import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { GuardFailure } from './../../../../../src/lib/core/logic/GuardFailure';
import { Either } from './../../../../../src/lib/core/logic/Either';
import { Amount } from './../../../../../src/lib/domain/Amount';

import { Payment } from './../../../../../src/lib/modules/payments/domain/Payment';
import { InvoiceId } from '../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { PayerId } from '../../../../../src/lib/modules/payers/domain/PayerId';

let maybePayment: Either<GuardFailure, Payment>;
let payload;

Before({ tags: '@ValidatePayment' }, () => {
  payload = {
    invoiceId: InvoiceId.create(new UniqueEntityID('invoice-id')),
    payerId: PayerId.create(new UniqueEntityID('payer-id')),
    amount: Amount.create(100),
  };
});

Given('There is a Payment Domain Entity', function () {
  return;
});

When('The Payment.create method is called', function () {
  maybePayment = Payment.create(payload);
});

Then('A new Payment is successfully created', function () {
  expect(maybePayment.isRight()).to.equal(true);

  if (maybePayment.isLeft()) {
    throw maybePayment.value;
  }

  const payment = maybePayment.value;
  expect(payment.invoiceId).to.equal(payload.invoiceId);
  expect(payment.payerId).to.equal(payload.payerId);
  expect(payment.amount).to.equal(payload.amount);
});
