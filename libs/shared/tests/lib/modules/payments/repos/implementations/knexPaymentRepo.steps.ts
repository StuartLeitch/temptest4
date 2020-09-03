import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { PaymentId } from '../../../../../../src/lib/modules/payments/domain/PaymentId';
import { PaymentMap } from '../../../../../../src/lib/modules/payments/mapper/Payment';
import { Payment } from '../../../../../../src/lib/modules/payments/domain/Payment';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockPaymentRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentRepo';

const paymentData = {
  id: 'payment-1',
  payerId: 'payer-1',
  invoiceId: 'invoice-1',
  amount: 100,
  paymentId: 'pay--1',
  foreignPaymentId: 'foreign-pay-1',
  datePaid: new Date(),
  paymentProof: { name: 'foo', src: 'bar' },
};

let mockPaymentRepo: MockPaymentRepo;
let payment: Payment;
let savePayment: Payment;
let foundPayment: Payment;
let paymentExists: boolean;

function makePaymentData(overwrites?: any): Payment {
  return PaymentMap.toDomain({
    ...paymentData,
    ...overwrites,
  });
}

Before(async () => {
  mockPaymentRepo = new MockPaymentRepo();
});

Given(/^a payment with the id "([\w-]+)"$/, async (paymentId: string) => {
  payment = makePaymentData({ id: paymentId });
  await mockPaymentRepo.save(payment);
});

When(/^we call getPaymentById for "([\w-]+)"$/, async (paymentId: string) => {
  const paymentIdObj = PaymentId.create(
    new UniqueEntityID(paymentId)
  ).getValue();
  foundPayment = await mockPaymentRepo.getPaymentById(paymentIdObj);
});

Then('getPaymentById returns payment', async () => {
  expect(foundPayment).to.equal(payment);
});

When(
  /^we call getPaymentById for an un-existent payment "([\w-]+)"$/,
  async (wrongPaymentId: string) => {
    const id = PaymentId.create(new UniqueEntityID(wrongPaymentId)).getValue();
    foundPayment = await mockPaymentRepo.getPaymentById(id);
  }
);

Then('getPaymentById returns null', async () => {
  expect(foundPayment).to.equal(null);
});

When(/^we call exists for ([\w-]+) payment id$/, async (paymentId: string) => {
  const id = PaymentId.create(new UniqueEntityID(paymentId)).getValue();
  foundPayment = await mockPaymentRepo.getPaymentById(id);
  if (!foundPayment) {
    foundPayment = await makePaymentData({ id: paymentId });
  }
  paymentExists = await mockPaymentRepo.exists(foundPayment);
});

Then(/^Payment.exists returns (.*)$/, async (exists: string) => {
  expect(paymentExists).to.equal(exists === 'true');
});

Given(
  /^we have an payment object with the id "([\w-]+)"$/,
  async (paymentId: string) => {
    payment = makePaymentData({ id: paymentId });
  }
);

When('we call Payment.save on the payment object', async () => {
  savePayment = await mockPaymentRepo.save(payment);
});

Then('the Payment object should be saved', async () => {
  expect(savePayment).to.equal(payment);
});
