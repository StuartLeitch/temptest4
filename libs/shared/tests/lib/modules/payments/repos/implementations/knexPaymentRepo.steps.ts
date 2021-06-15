import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../../../src/lib/core/logic/GuardFailure';
import {
  RepoError,
  RepoErrorCode,
} from '../../../../../../src/lib/infrastructure/RepoError';
import { Either } from '../../../../../../src/lib/core/logic/Either';

import { PaymentId } from '../../../../../../src/lib/modules/payments/domain/PaymentId';
import { PaymentMap } from '../../../../../../src/lib/modules/payments/mapper/Payment';
import { Payment } from '../../../../../../src/lib/modules/payments/domain/Payment';

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

let maybeFoundPayment: Either<GuardFailure | RepoError, Payment>;
let mockPaymentRepo: MockPaymentRepo;
let payment: Payment;
let savePayment: Payment;
let foundPayment: Payment;
let paymentExists: boolean;

function makePaymentData(overwrites?: any): Payment {
  const payment = PaymentMap.toDomain({
    ...paymentData,
    ...overwrites,
  });

  if (payment.isLeft()) {
    throw payment.value;
  }

  return payment.value;
}

Before({ tags: '@ValidateKnexPaymentRepo' }, async () => {
  mockPaymentRepo = new MockPaymentRepo();
});

Given(/^a payment with the id "([\w-]+)"$/, async (paymentId: string) => {
  payment = makePaymentData({ id: paymentId });
  await mockPaymentRepo.save(payment);
});

When(/^we call getPaymentById for "([\w-]+)"$/, async (paymentId: string) => {
  const paymentIdObj = PaymentId.create(new UniqueEntityID(paymentId));
  const maybeFoundPayment = await mockPaymentRepo.getPaymentById(paymentIdObj);

  if (maybeFoundPayment.isLeft()) {
    throw maybeFoundPayment.value;
  }

  foundPayment = maybeFoundPayment.value;
});

Then('getPaymentById returns payment', async () => {
  expect(foundPayment).to.equal(payment);
});

When(
  /^we call getPaymentById for an un-existent payment "([\w-]+)"$/,
  async (wrongPaymentId: string) => {
    const id = PaymentId.create(new UniqueEntityID(wrongPaymentId));
    maybeFoundPayment = await mockPaymentRepo.getPaymentById(id);

    if (maybeFoundPayment.isRight()) {
      foundPayment = maybeFoundPayment.value;
    } else {
      foundPayment = null;
    }
  }
);

Then('getPaymentById returns null', async () => {
  expect(foundPayment).to.equal(null);
  expect(maybeFoundPayment.isLeft()).to.be.true;
  expect(maybeFoundPayment.value instanceof RepoError).to.be.true;

  if (maybeFoundPayment.value instanceof RepoError) {
    expect(maybeFoundPayment.value.code).to.equal(
      RepoErrorCode.ENTITY_NOT_FOUND
    );
  }
});

When(/^we call exists for ([\w-]+) payment id$/, async (paymentId: string) => {
  const id = PaymentId.create(new UniqueEntityID(paymentId));
  maybeFoundPayment = await mockPaymentRepo.getPaymentById(id);

  if (maybeFoundPayment.isRight()) {
    foundPayment = maybeFoundPayment.value;

    if (!foundPayment) {
      foundPayment = makePaymentData({ id: paymentId });
    }

    const maybePaymentExists = await mockPaymentRepo.exists(foundPayment);

    if (maybePaymentExists.isLeft()) {
      throw maybePaymentExists.value;
    }

    paymentExists = maybePaymentExists.value;
  } else {
    paymentExists = false;
    foundPayment = null;
  }
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
  const maybeSavePayment = await mockPaymentRepo.save(payment);

  if (maybeSavePayment.isLeft()) {
    throw maybeSavePayment.value;
  }

  savePayment = maybeSavePayment.value;
});

Then('the Payment object should be saved', async () => {
  expect(savePayment).to.equal(payment);
});
