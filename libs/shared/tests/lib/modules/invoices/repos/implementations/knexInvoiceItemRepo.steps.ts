import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { GuardFailure } from '../../../../../../src/lib/core/logic/GuardFailure';
import { RepoError } from '../../../../../../src/lib/infrastructure/RepoError';
import { Either } from '../../../../../../src/lib/core/logic/Either';

import { InvoiceItemId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItemId';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';

function makeInvoiceItemData(overwrites?: any): InvoiceItem {
  const invoiceItem = InvoiceItemMap.toDomain({
    manuscriptId: 'manuscript-id-1',
    invoiceId: 'invoice-id-1',
    price: 0,
    dateCreated: new Date(),
    ...overwrites,
  });

  if (invoiceItem.isLeft()) {
    throw invoiceItem.value;
  }

  return invoiceItem.value;
}

let mockInvoiceItemRepo: MockInvoiceItemRepo;
let invoiceItem: InvoiceItem;
let saveInvoiceItem: InvoiceItem;
let foundInvoiceItem: InvoiceItem;
let invoiceItemExists: boolean;
let maybeFoundInvoiceItem: Either<GuardFailure | RepoError, InvoiceItem>;

Before({ tags: '@ValidateKnexInvoiceItemRepo' }, async () => {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  maybeFoundInvoiceItem = null;
  invoiceItem = null;
});

Given(
  /^a invoice item with the id "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    invoiceItem = makeInvoiceItemData({ id: invoiceItemId });
    await mockInvoiceItemRepo.save(invoiceItem);
  }
);

When(
  /^we call getInvoiceItemById for "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    const invoiceItemIdObj = InvoiceItemId.create(
      new UniqueEntityID(invoiceItemId)
    );
    const maybeFoundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );

    if (maybeFoundInvoiceItem.isLeft()) {
      throw maybeFoundInvoiceItem.value;
    }

    foundInvoiceItem = maybeFoundInvoiceItem.value;
  }
);

Then('getInvoiceItemById returns invoice item', async () => {
  expect(foundInvoiceItem.id.toValue).to.equal(invoiceItem.id.toValue);
});

When(
  /^we call getInvoiceItemById for an un-existent invoice item "([\w-]+)"$/,
  async (wrongInvoiceItemId: string) => {
    const id = InvoiceItemId.create(new UniqueEntityID(wrongInvoiceItemId));
    maybeFoundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(id);

    if (maybeFoundInvoiceItem.isRight()) {
      foundInvoiceItem = maybeFoundInvoiceItem.value;
    } else {
      foundInvoiceItem = null;
    }
  }
);

Then('getInvoiceItemById returns null', async () => {
  expect(foundInvoiceItem).to.equal(null);
});

When(
  /^we call delete for the invoice item "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    const invoiceItemIdObj = InvoiceItemId.create(
      new UniqueEntityID(invoiceItemId)
    );
    const maybeFoundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );

    if (maybeFoundInvoiceItem.isLeft()) {
      throw maybeFoundInvoiceItem.value;
    }

    foundInvoiceItem = maybeFoundInvoiceItem.value;

    const maybeResult = await mockInvoiceItemRepo.delete(foundInvoiceItem);

    if (maybeResult.isLeft()) {
      throw maybeResult.value;
    }
  }
);

Then(
  /^delete soft deletes the invoice item "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    const invoiceItemIdObj = InvoiceItemId.create(
      new UniqueEntityID(invoiceItemId)
    );
    const index = mockInvoiceItemRepo.deletedItems.findIndex((item) =>
      item.id.equals(invoiceItemIdObj.id)
    );

    expect(index).to.not.equal(-1);
  }
);

When(
  /^we call update for invoice item "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    const invoiceItemIdObj = InvoiceItemId.create(
      new UniqueEntityID(invoiceItemId)
    );
    const maybeFoundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );

    if (maybeFoundInvoiceItem.isLeft()) {
      throw maybeFoundInvoiceItem.value;
    }

    foundInvoiceItem = maybeFoundInvoiceItem.value;

    const invoiceItemPrice = 0;
    foundInvoiceItem.price = invoiceItemPrice;

    const maybeResult = await mockInvoiceItemRepo.update(foundInvoiceItem);

    if (maybeResult.isLeft()) {
      throw maybeResult.value;
    }
  }
);

Then(
  /^update modifies the invoice item "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    const invoiceItemIdObj = InvoiceItemId.create(
      new UniqueEntityID(invoiceItemId)
    );
    const maybeFoundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );

    if (maybeFoundInvoiceItem.isLeft()) {
      throw maybeFoundInvoiceItem.value;
    }

    foundInvoiceItem = maybeFoundInvoiceItem.value;

    expect(foundInvoiceItem.price).to.equal(0);
  }
);

When(
  /^we call exists for ([\w-]+) invoice item id$/,
  async (invoiceItemId: string) => {
    const id = InvoiceItemId.create(new UniqueEntityID(invoiceItemId));
    maybeFoundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(id);

    if (maybeFoundInvoiceItem.isRight()) {
      foundInvoiceItem = maybeFoundInvoiceItem.value;

      if (!foundInvoiceItem) {
        foundInvoiceItem = await makeInvoiceItemData({ id: invoiceItemId });
      }

      const maybeInvoiceItemExists = await mockInvoiceItemRepo.exists(
        foundInvoiceItem
      );

      if (maybeInvoiceItemExists.isLeft()) {
        throw maybeInvoiceItemExists.value;
      }

      invoiceItemExists = maybeInvoiceItemExists.value;
    } else {
      invoiceItem = null;
      invoiceItemExists = false;
    }
  }
);

Then(/^InvoiceItem.exists returns (.*)$/, async (exists: string) => {
  expect(invoiceItemExists).to.equal(exists === 'true');
});

Given(
  /^we have an invoice item object with the id "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    invoiceItem = makeInvoiceItemData({ id: invoiceItemId });
  }
);

When('we call InvoiceItem.save on the invoice item object', async () => {
  const maybeSaveInvoiceItem = await mockInvoiceItemRepo.save(invoiceItem);

  if (maybeSaveInvoiceItem.isLeft()) {
    throw maybeSaveInvoiceItem.value;
  }

  saveInvoiceItem = maybeSaveInvoiceItem.value;
});

Then('the invoice item object should be saved', async () => {
  expect(saveInvoiceItem.id.toValue).to.equal(invoiceItem.id.toValue);
});
