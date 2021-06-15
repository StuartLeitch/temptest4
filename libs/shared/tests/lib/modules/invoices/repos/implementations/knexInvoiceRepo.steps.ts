import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { GuardFailure } from '../../../../../../src/lib/core/logic/GuardFailure';
import { RepoError } from '../../../../../../src/lib/infrastructure/RepoError';
import { Either } from '../../../../../../src/lib/core/logic/Either';

import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { Invoice } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';
import { InvoiceStatus } from './../../../../../../src/lib/modules/invoices/domain/Invoice';
import { TransactionId } from './../../../../../../src/lib/modules/transactions/domain/TransactionId';

import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

function makeInvoiceData(overwrites?: any): Invoice {
  const invoice = InvoiceMap.toDomain({
    status: InvoiceStatus.DRAFT,
    dateCreated: new Date(),
    deleted: 0,
    ...overwrites,
  });

  if (invoice.isLeft()) {
    throw invoice.value;
  }

  return invoice.value;
}

let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockArticleRepo: MockArticleRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let invoice: Invoice;
let invoiceExists: boolean;
let saveInvoice: Invoice;
let invoiceList: Invoice[];
let foundInvoice: Invoice;
let maybeInvoiceList: Either<GuardFailure | RepoError, Invoice[]>;

let lastInvoiceNumber: number = 1;

Before({ tags: '@ValidateKnexInvoiceRepo' }, async () => {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockArticleRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
});

Given(
  /^a invoice with the id "([\w-]+)" and transaction id "([\w-]+)"$/,
  async (invoiceId: string, transactionId: string) => {
    invoice = makeInvoiceData({ id: invoiceId, transactionId: transactionId });
    const maybeInvoice = await mockInvoiceRepo.save(invoice);

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    invoice = maybeInvoice.value;
  }
);

When(/^we call getInvoiceById for "([\w-]+)"$/, async (invoiceId: string) => {
  const invoiceIdObj = InvoiceId.create(new UniqueEntityID(invoiceId));
  const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);

  if (maybeFoundInvoice.isLeft()) {
    throw maybeFoundInvoice.value;
  }

  foundInvoice = maybeFoundInvoice.value;
});

Then('getInvoiceById returns the invoice', async () => {
  expect(foundInvoice.id.toValue()).to.equal(invoice.id.toValue());
});

When(
  /^we call getInvoiceById for an un-existent invoice "([\w-]+)"$/,
  async (wrongInvoiceId: string) => {
    const id = InvoiceId.create(new UniqueEntityID(wrongInvoiceId));

    const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(id);

    if (maybeFoundInvoice.isLeft()) {
      throw maybeFoundInvoice.value;
    }

    foundInvoice = maybeFoundInvoice.value;
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

    maybeInvoiceList = await mockInvoiceRepo.getInvoicesByTransactionId(
      transactionIdObj
    );

    if (maybeInvoiceList.isRight()) {
      invoiceList = maybeInvoiceList.value;
    } else {
      invoiceList = null;
    }
  }
);
Then(
  /^getInvoiceByTransactionId returns the (\d+) invoices$/,
  async (count: number) => {
    expect(maybeInvoiceList.isRight()).to.be.true;
    expect(invoiceList.length).to.equal(count);
  }
);
Then('getInvoiceByTransactionId returns null', async () => {
  expect(maybeInvoiceList.isLeft()).to.be.true;
  expect(invoiceList).to.equal(null);
});

When(
  /^we call delete for the invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    const invoiceIdObj = InvoiceId.create(new UniqueEntityID(invoiceId));

    const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(
      invoiceIdObj
    );

    if (maybeFoundInvoice.isLeft()) {
      throw maybeFoundInvoice.value;
    }

    foundInvoice = maybeFoundInvoice.value;

    const maybeResult = await mockInvoiceRepo.delete(foundInvoice);

    if (maybeResult.isLeft()) {
      throw maybeResult.value;
    }
  }
);

Then(
  /^delete soft deletes the invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    const invoiceIdObj = InvoiceId.create(new UniqueEntityID(invoiceId));
    const index = mockInvoiceRepo.deletedItems.findIndex((item) =>
      item.id.equals(invoiceIdObj.id)
    );
    expect(index).to.not.equal(-1);
  }
);

When(/^we call update for invoice "([\w-]+)"$/, async (invoiceId: string) => {
  const invoiceIdObj = InvoiceId.create(new UniqueEntityID(invoiceId));

  const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);

  if (maybeFoundInvoice.isLeft()) {
    throw maybeFoundInvoice.value;
  }

  foundInvoice = maybeFoundInvoice.value;

  const invoiceNumber = 1111;
  foundInvoice.invoiceNumber = invoiceNumber;

  const maybeResult = await mockInvoiceRepo.update(foundInvoice);

  if (maybeResult.isLeft()) {
    throw maybeResult.value;
  }
});

Then(/^update modifies the invoice "([\w-]+)"$/, async (invoiceId: string) => {
  const invoiceIdObj = InvoiceId.create(new UniqueEntityID(invoiceId));

  const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(invoiceIdObj);

  if (maybeFoundInvoice.isLeft()) {
    throw maybeFoundInvoice.value;
  }

  foundInvoice = maybeFoundInvoice.value;

  expect(foundInvoice.invoiceNumber).to.equal('1111');
});

When(/^we call exists for ([\w-]+) invoice id$/, async (invoiceId: string) => {
  const id = InvoiceId.create(new UniqueEntityID(invoiceId));

  const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(id);

  if (maybeFoundInvoice.isLeft()) {
    throw maybeFoundInvoice.value;
  }

  foundInvoice = maybeFoundInvoice.value;

  if (!foundInvoice) {
    foundInvoice = makeInvoiceData({ id: invoiceId });
  }

  const maybeInvoiceExists = await mockInvoiceRepo.exists(foundInvoice);

  if (maybeInvoiceExists.isLeft()) {
    throw maybeInvoiceExists.value;
  }

  invoiceExists = maybeInvoiceExists.value;
});

Then(/^Invoice.exists returns (.*)$/, async (exists: string) => {
  expect(String(invoiceExists)).to.equal(exists);
});

Given(
  /^we have an invoice object with the id "([\w-]+)"$/,
  async (invoiceId: string) => {
    invoice = makeInvoiceData({ id: invoiceId });
  }
);

When('we call Invoice.save on the invoice object', async () => {
  const maybeSaveInvoice = await mockInvoiceRepo.save(invoice);

  if (maybeSaveInvoice.isLeft()) {
    throw maybeSaveInvoice.value;
  }

  saveInvoice = maybeSaveInvoice.value;
});

Then('the invoice object should be saved', async () => {
  expect(saveInvoice.id.toValue()).to.equal(invoice.id.toValue());
});

Given('the invoice number counter resets to {int}', async (int) => {
  mockInvoiceRepo.clear();
});

When(
  /^we add an invoice object with the id "([\w-]+)"$/,
  async (invoiceId: string) => {
    invoice = makeInvoiceData({ id: invoiceId });
    await mockInvoiceRepo.save(invoice);
  }
);

When(
  /^we call Invoice.assignInvoiceNumber on the invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    const id = InvoiceId.create(new UniqueEntityID(invoiceId));
    const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(id);

    if (maybeFoundInvoice.isLeft()) {
      throw maybeFoundInvoice.value;
    }

    foundInvoice = maybeFoundInvoice.value;

    lastInvoiceNumber = await mockInvoiceRepo.getCurrentInvoiceNumber();
    foundInvoice.assignInvoiceNumber(lastInvoiceNumber);
  }
);

Then(
  /^the invoice number of "([\w-]+)" should be ([\w-]+)$/,
  async (invoiceId: string, invoiceNumber: string) => {
    const id = InvoiceId.create(new UniqueEntityID(invoiceId));
    const maybeFoundInvoice = await mockInvoiceRepo.getInvoiceById(id);

    if (maybeFoundInvoice.isLeft()) {
      throw maybeFoundInvoice.value;
    }

    foundInvoice = maybeFoundInvoice.value;
  }
);
