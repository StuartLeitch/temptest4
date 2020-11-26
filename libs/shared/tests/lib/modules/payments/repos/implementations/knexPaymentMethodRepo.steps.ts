import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { PaymentMethodId } from '../../../../../../src/lib/modules/payments/domain/PaymentMethodId';
import { PaymentMethodMap } from '../../../../../../src/lib/modules/payments/mapper/PaymentMethod';
import { PaymentMethod } from '../../../../../../src/lib/modules/payments/domain/PaymentMethod';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockPaymentMethodRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentMethodRepo';

let mockPaymentMethodRepo: MockPaymentMethodRepo;
let paymentMethod: PaymentMethod;
let foundPayment: PaymentMethod;
let paymentMethodExists: boolean;
let savePaymentMethod;

function makePaymentMethodData(overwrites?: any): PaymentMethod {
  return PaymentMethodMap.toDomain({
    name: 'Credit Card',
    isActive: true,
    paymentProof: {},
    ...overwrites,
  });
}

Before(async () => {
  mockPaymentMethodRepo = new MockPaymentMethodRepo();
});

Given(
  /^a payment method with the id "([\w-]+)"$/,
  async (paymentMethodId: string) => {
    paymentMethod = makePaymentMethodData({ id: paymentMethodId });
    await mockPaymentMethodRepo.save(paymentMethod);
  }
);

When(
  /^we call getPaymentMethodById for "([\w-]+)"$/,
  async (paymentMethodId: string) => {
    const paymentMethodIdObj = PaymentMethodId.create(
      new UniqueEntityID(paymentMethodId)
    );
    foundPayment = await mockPaymentMethodRepo.getPaymentMethodById(
      paymentMethodIdObj
    );
  }
);

Then('getPaymentMethodById returns payment method', async () => {
  expect(foundPayment).to.equal(paymentMethod);
});

When(
  /^we call getPaymentMethodById for an un-existent payment method "([\w-]+)"$/,
  async (wrongPaymentMethodId: string) => {
    const id = PaymentMethodId.create(new UniqueEntityID(wrongPaymentMethodId));
    foundPayment = await mockPaymentMethodRepo.getPaymentMethodById(id);
  }
);

Then('getPaymentMethodById returns null', async () => {
  expect(foundPayment).to.equal(null);
});

When(
  /^we call exists for ([\w-]+) payment method id$/,
  async (paymentMethodId: string) => {
    const id = PaymentMethodId.create(new UniqueEntityID(paymentMethodId));
    foundPayment = await mockPaymentMethodRepo.getPaymentMethodById(id);
    if (!foundPayment) {
      foundPayment = await makePaymentMethodData({ id: paymentMethodId });
    }
    paymentMethodExists = await mockPaymentMethodRepo.exists(foundPayment);
  }
);

Then(/^PaymentMethod.exists returns (.*)$/, async (exists: string) => {
  expect(paymentMethodExists).to.equal(exists === 'true');
});

Given(
  /^we have an payment method object with the id "([\w-]+)"$/,
  async (paymentMethodId: string) => {
    paymentMethod = makePaymentMethodData({ id: paymentMethodId });
  }
);

When('we call PaymentMethod.save on the payment method object', async () => {
  savePaymentMethod = await mockPaymentMethodRepo.save(paymentMethod);
});

Then('the PaymentMethod object should be saved', async () => {
  expect(savePaymentMethod).to.equal(paymentMethod);
});
