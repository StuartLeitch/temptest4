import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { Invoice } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';
import { InvoiceStatus } from './../../../../../../src/lib/modules/invoices/domain/Invoice';
import { TransactionId } from './../../../../../../src/lib/modules/transactions/domain/TransactionId';

import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';

function makeInvoiceData(overwrites?: any): Invoice {
  return InvoiceMap.toDomain({
    status: InvoiceStatus.DRAFT,
    dateCreated: new Date(),
    deleted: 0,
    ...overwrites,
  });
}

let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockArticleRepo: MockArticleRepo;
let invoice: Invoice;
let invoiceExists: boolean;
let saveInvoice: Invoice;
let invoiceList: Invoice[];
let foundInvoice: Invoice;

Before(async () => {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockArticleRepo = new MockArticleRepo();
  mockInvoiceRepo = new MockInvoiceRepo(mockArticleRepo, mockInvoiceItemRepo);
});

Given(
  /^a invoice with the id "([\w-]+)" and transaction id "([\w-]+)"$/,
  async (invoiceId: string, transactionId: string) => {
    invoice = makeInvoiceData({ id: invoiceId, transactionId: transactionId });
    invoice = await mockInvoiceRepo.save(invoice);
  }
);

When(/^we call getInvoiceById for "([\w-]+)"$/, async (invoiceId: string) => {
  const invoiceIdObj = InvoiceId.create(
    new UniqueEntityID(invoiceId)
  ).getValue();
  foundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);
});

Then('getInvoiceById returns the invoice', async () => {
  expect(foundInvoice.id.toValue()).to.equal(invoice.id.toValue());
});

When(
  /^we call getInvoiceById for an un-existent invoice "([\w-]+)"$/,
  async (wrongInvoiceId: string) => {
    const id = InvoiceId.create(new UniqueEntityID(wrongInvoiceId)).getValue();
    foundInvoice = await mockInvoiceRepo.getInvoiceById(id);
  }
);

Then('getInvoiceById returns null', async () => {
  expect(foundInvoice).to.equal(null);
});

When(
  /^we call getInvoiceByTransactionId for "([\w-]+)"$/,
  async (transactionId: string) => {
    const transactionIdObj = TransactionId.create(
      new UniqueEntityID(transactionId)
    );
    invoiceList = await mockInvoiceRepo.getInvoicesByTransactionId(
      transactionIdObj
    );
  }
);
Then(
  /^getInvoiceByTransactionId returns the (\d+) invoices$/,
  async (count: number) => {
    expect(invoiceList.length).to.equal(count);
  }
);
Then('getInvoiceByTransactionId returns null', async () => {
  expect(invoiceList).to.equal(null);
});

When(
  /^we call delete for the invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    const invoiceIdObj = InvoiceId.create(
      new UniqueEntityID(invoiceId)
    ).getValue();
    foundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);
    await mockInvoiceRepo.delete(foundInvoice);
  }
);

Then(
  /^delete soft deletes the invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    const invoiceIdObj = InvoiceId.create(
      new UniqueEntityID(invoiceId)
    ).getValue();
    foundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);
    expect(foundInvoice).to.equal(null);
  }
);

When(/^we call update for invoice "([\w-]+)"$/, async (invoiceId: string) => {
  const invoiceIdObj = InvoiceId.create(
    new UniqueEntityID(invoiceId)
  ).getValue();
  foundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);
  const invoiceNumber = '1111';
  foundInvoice.invoiceNumber = invoiceNumber;
  await mockInvoiceRepo.update(foundInvoice);
});

Then(/^update modifies the invoice "([\w-]+)"$/, async (invoiceId: string) => {
  const invoiceIdObj = InvoiceId.create(
    new UniqueEntityID(invoiceId)
  ).getValue();
  foundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);
  expect(foundInvoice.invoiceNumber).to.equal('1111');
});

When(/^we call exists for ([\w-]+) invoice id$/, async (invoiceId: string) => {
  const id = InvoiceId.create(new UniqueEntityID(invoiceId)).getValue();
  foundInvoice = await mockInvoiceRepo.getInvoiceById(id);
  if (!foundInvoice) {
    foundInvoice = await makeInvoiceData({ id: invoiceId });
  }
  invoiceExists = await mockInvoiceRepo.exists(foundInvoice);
});

Then(/^Invoice.exists returns (.*)$/, async (exists: string) => {
  expect(invoiceExists).to.equal(exists === 'true');
});

Given(
  /^we have an invoice object with the id "([\w-]+)"$/,
  async (invoiceId: string) => {
    invoice = makeInvoiceData({ id: invoiceId });
  }
);

When('we call Invoice.save on the invoice object', async () => {
  saveInvoice = await mockInvoiceRepo.save(invoice);
});

Then('the invoice object should be saved', async () => {
  expect(saveInvoice.id.toValue()).to.equal(invoice.id.toValue());
});

When(
  /^we call Invoice.assignInvoiceNumber on the invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    const id = InvoiceId.create(new UniqueEntityID(invoiceId)).getValue();
    foundInvoice = await mockInvoiceRepo.getInvoiceById(id);
    await mockInvoiceRepo.assignInvoiceNumber(foundInvoice);
  }
);

Then(
  /^the invoice number of "([\w-]+)" should be ([\w-]+)$/,
  async (invoiceId: string, invoiceNumber: string) => {
    const id = InvoiceId.create(new UniqueEntityID(invoiceId)).getValue();
    foundInvoice = await mockInvoiceRepo.getInvoiceById(id);
    expect(foundInvoice.invoiceNumber).to.equal(invoiceNumber);
  }
);
