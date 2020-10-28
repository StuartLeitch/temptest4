import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { InvoiceItemId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItemId';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';

function makeInvoiceItemData(overwrites?: any): InvoiceItem {
  return InvoiceItemMap.toDomain({
    manuscriptId: 'manuscript-id-1',
    invoiceId: 'invoice-id-1',
    price: 0,
    dateCreated: new Date(),
    ...overwrites,
  });
}

let mockInvoiceItemRepo: MockInvoiceItemRepo;
let invoiceItem: InvoiceItem;
let saveInvoiceItem: InvoiceItem;
let foundInvoiceItem: InvoiceItem;
let invoiceItemExists: boolean;

Before(async () => {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
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
    foundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );
  }
);

Then('getInvoiceItemById returns invoice item', async () => {
  expect(foundInvoiceItem).to.equal(invoiceItem);
});

When(
  /^we call getInvoiceItemById for an un-existent invoice item "([\w-]+)"$/,
  async (wrongInvoiceItemId: string) => {
    const id = InvoiceItemId.create(new UniqueEntityID(wrongInvoiceItemId));
    foundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(id);
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
    foundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );
    await mockInvoiceItemRepo.delete(foundInvoiceItem);
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
    foundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );
    const invoiceItemPrice = 0;
    foundInvoiceItem.price = invoiceItemPrice;
    await mockInvoiceItemRepo.update(foundInvoiceItem);
  }
);

Then(
  /^update modifies the invoice item "([\w-]+)"$/,
  async (invoiceItemId: string) => {
    const invoiceItemIdObj = InvoiceItemId.create(
      new UniqueEntityID(invoiceItemId)
    );
    foundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(
      invoiceItemIdObj
    );
    expect(foundInvoiceItem.price).to.equal(0);
  }
);

When(
  /^we call exists for ([\w-]+) invoice item id$/,
  async (invoiceItemId: string) => {
    const id = InvoiceItemId.create(new UniqueEntityID(invoiceItemId));
    foundInvoiceItem = await mockInvoiceItemRepo.getInvoiceItemById(id);
    if (!foundInvoiceItem) {
      foundInvoiceItem = await makeInvoiceItemData({ id: invoiceItemId });
    }
    invoiceItemExists = await mockInvoiceItemRepo.exists(foundInvoiceItem);
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
  saveInvoiceItem = await mockInvoiceItemRepo.save(invoiceItem);
});

Then('the invoice item object should be saved', async () => {
  expect(saveInvoiceItem).to.equal(invoiceItem);
});
