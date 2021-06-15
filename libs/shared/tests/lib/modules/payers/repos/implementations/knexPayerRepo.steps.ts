import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { PayerMap } from './../../../../../../src/lib/modules/payers/mapper/Payer';
import { Payer } from '../../../../../../src/lib/modules/payers/domain/Payer';
import { PayerId } from './../../../../../../src/lib/modules/payers/domain/PayerId';
import { PayerType } from './../../../../../../src/lib/modules/payers/domain/Payer';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockPayerRepo } from './../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';

const payerData = {
  type: PayerType.INDIVIDUAL,
  title: 'Mr',
  name: 'Skywalker',
  organization: 'Rebel Alliance',
  uniqueIdentificationNumber: '123456233',
  email: 'luke@rebelalliance.universe',
  phone: '911',
  shippingAddressId: 'Tatooine',
  billingAddressId: 'Tatooine',
  vatId: 'vat-1',
  dateAdded: new Date(),
};

function makePayerData(overwrites?: any): Payer {
  const payer = PayerMap.toDomain({
    ...payerData,
    ...overwrites,
  });

  if (payer.isLeft()) {
    throw payer.value;
  }

  return payer.value;
}

let mockPayerRepo: MockPayerRepo;
let payer: Payer;
let payerExists: boolean;
let savePayer: Payer;
let foundPayer: Payer;

Before({ tags: '@ValidateKnexPayerRepo' }, async () => {
  mockPayerRepo = new MockPayerRepo();
});

Given(/^a payer with the id "([\w-]+)"$/, async (payerId: string) => {
  payer = makePayerData({ id: payerId });

  const maybePayer = await mockPayerRepo.save(payer);

  if (maybePayer.isLeft()) {
    throw maybePayer.value;
  }

  payer = maybePayer.value;
});

When(/^we call getPayerById for "([\w-]+)"$/, async (payerId: string) => {
  const payerIdObj = PayerId.create(new UniqueEntityID(payerId));
  const maybeFoundPayer = await mockPayerRepo.getPayerById(payerIdObj);

  if (maybeFoundPayer.isLeft()) {
    throw maybeFoundPayer.value;
  }

  foundPayer = maybeFoundPayer.value;
});

Then('getPayerById returns the payer', async () => {
  expect(foundPayer.id.toValue()).to.equal(payer.id.toValue());
});

When(
  /^we call getPayerById for an un-existent payer "([\w-]+)"$/,
  async (wrongPayerId: string) => {
    const id = PayerId.create(new UniqueEntityID(wrongPayerId));
    const maybeFoundPayer = await mockPayerRepo.getPayerById(id);

    if (maybeFoundPayer.isLeft()) {
      throw maybeFoundPayer.value;
    }

    foundPayer = maybeFoundPayer.value;
  }
);

Then('getPayerById returns null', async () => {
  expect(foundPayer).to.equal(null);
});

When(/^we call exists for ([\w-]+) payer id$/, async (payerId: string) => {
  const id = PayerId.create(new UniqueEntityID(payerId));
  const maybeFoundPayer = await mockPayerRepo.getPayerById(id);

  if (maybeFoundPayer.isLeft()) {
    throw maybeFoundPayer.value;
  }

  foundPayer = maybeFoundPayer.value;

  if (!foundPayer) {
    foundPayer = await makePayerData({ id: payerId });
  }

  const maybePayerExists = await mockPayerRepo.exists(foundPayer);

  if (maybePayerExists.isLeft()) {
    throw maybePayerExists.value;
  }

  payerExists = maybePayerExists.value;
});

Then(/^Payer.exists returns (.*)$/, async (exists: string) => {
  expect(payerExists).to.equal(exists === 'true');
});

Given(
  /^we have an payer object with the id "([\w-]+)"$/,
  async (payerId: string) => {
    payer = makePayerData({ id: payerId });
  }
);

When('we call Payer.save on the payer object', async () => {
  const maybeSavePayer = await mockPayerRepo.save(payer);

  if (maybeSavePayer.isLeft()) {
    throw maybeSavePayer.value;
  }

  savePayer = maybeSavePayer.value;
});

Then('the payer object should be saved', async () => {
  expect(savePayer).to.equal(payer);
});
