import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { GuardFailure } from '../../../../../../src/lib/core/logic/GuardFailure';
import { RepoError } from '../../../../../../src/lib/infrastructure/RepoError';
import { Either } from '../../../../../../src/lib/core/logic/Either';

import { PaymentMethodId } from '../../../../../../src/lib/modules/payments/domain/PaymentMethodId';
import { PaymentMethodMap } from '../../../../../../src/lib/modules/payments/mapper/PaymentMethod';
import { PaymentMethod } from '../../../../../../src/lib/modules/payments/domain/PaymentMethod';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockPaymentMethodRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentMethodRepo';

let maybeFoundPaymentMethod: Either<GuardFailure | RepoError, PaymentMethod>;
let mockPaymentMethodRepo: MockPaymentMethodRepo;
let savePaymentMethod: PaymentMethod;
let paymentMethod: PaymentMethod;
let paymentMethodExists: boolean;
let foundPayment: PaymentMethod;

function makePaymentMethodData(overwrites?: any): PaymentMethod {
  const paymentMethod = PaymentMethodMap.toDomain({
    name: 'Credit Card',
    isActive: true,
    paymentProof: {},
    ...overwrites,
  });

  if (paymentMethod.isLeft()) {
    throw paymentMethod.value;
  }

  return paymentMethod.value;
}

Before({ tags: '@ValidateKnexPaymentMethodRepo' }, async () => {
  mockPaymentMethodRepo = new MockPaymentMethodRepo();
  maybeFoundPaymentMethod = null;
  paymentMethodExists = null;
  savePaymentMethod = null;
  paymentMethod = null;
  foundPayment = null;
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

    const maybeFoundPayment = await mockPaymentMethodRepo.getPaymentMethodById(
      paymentMethodIdObj
    );

    if (maybeFoundPayment.isLeft()) {
      throw maybeFoundPayment.value;
    }

    foundPayment = maybeFoundPayment.value;
  }
);

Then('getPaymentMethodById returns payment method', async () => {
  expect(foundPayment).to.equal(paymentMethod);
});

When(
  /^we call getPaymentMethodById for an un-existent payment method "([\w-]+)"$/,
  async (wrongPaymentMethodId: string) => {
    const id = PaymentMethodId.create(new UniqueEntityID(wrongPaymentMethodId));

    maybeFoundPaymentMethod = await mockPaymentMethodRepo.getPaymentMethodById(
      id
    );

    if (maybeFoundPaymentMethod.isRight()) {
      foundPayment = maybeFoundPaymentMethod.value;
    }
  }
);

Then('getPaymentMethodById returns null', async () => {
  expect(foundPayment).to.equal(null);
});

When(
  /^we call exists for ([\w-]+) payment method id$/,
  async (paymentMethodId: string) => {
    const id = PaymentMethodId.create(new UniqueEntityID(paymentMethodId));

    maybeFoundPaymentMethod = await mockPaymentMethodRepo.getPaymentMethodById(
      id
    );

    if (maybeFoundPaymentMethod.isRight()) {
      foundPayment = maybeFoundPaymentMethod.value;

      if (!foundPayment) {
        foundPayment = makePaymentMethodData({ id: paymentMethodId });
      }

      const maybePaymentMethodExists = await mockPaymentMethodRepo.exists(
        foundPayment
      );

      if (maybePaymentMethodExists.isLeft()) {
        throw maybePaymentMethodExists.value;
      }

      paymentMethodExists = maybePaymentMethodExists.value;
    } else {
      paymentMethodExists = false;
    }
  }
);

Then(/^PaymentMethod.exists returns (.*)$/, async (exists: string) => {
  expect(maybeFoundPaymentMethod.isRight()).to.equal(exists === 'true');
  expect(paymentMethodExists).to.equal(exists === 'true');
});

Given(
  /^we have an payment method object with the id "([\w-]+)"$/,
  async (paymentMethodId: string) => {
    paymentMethod = makePaymentMethodData({ id: paymentMethodId });
  }
);

When('we call PaymentMethod.save on the payment method object', async () => {
  const maybeSavePaymentMethod = await mockPaymentMethodRepo.save(
    paymentMethod
  );

  if (maybeSavePaymentMethod.isLeft()) {
    throw maybeSavePaymentMethod.value;
  }

  savePaymentMethod = maybeSavePaymentMethod.value;
});

Then('the PaymentMethod object should be saved', async () => {
  expect(savePaymentMethod).to.equal(paymentMethod);
});
