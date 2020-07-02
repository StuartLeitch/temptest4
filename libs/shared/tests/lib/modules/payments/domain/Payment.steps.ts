import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { Amount } from './../../../../../src/lib/domain/Amount';
import { Payment } from './../../../../../src/lib/modules/payments/domain/Payment';
import { Result } from './../../../../../src/lib/core/logic/Result';
import { InvoiceId } from '../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { PayerId } from '../../../../../src/lib/modules/payers/domain/PayerId';

let paymentOrError: Result<Payment>;
let payload;

Before(() => {
  payload = {
    invoiceId: InvoiceId.create(
      new UniqueEntityID('invoice-id')
    ),
    payerId: PayerId.create(new UniqueEntityID('payer-id')),
    amount: Amount.create(100)
  }
})

Given('There is a Payment Domain Entity', function() {
  return;
});

When('The Payment.create method is called', function() {
  paymentOrError = Payment.create(payload);
});

Then('A new Payment is successfully created', function() {
  expect(paymentOrError.isSuccess).to.equal(true);
  const payment = paymentOrError.getValue();
  expect(payment.invoiceId).to.equal(payload.invoiceId);
  expect(payment.payerId).to.equal(payload.payerId);
  expect(payment.amount).to.equal(payload.amount);
});
