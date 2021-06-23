import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { ChangeInvoiceStatus } from '../../../../../../src/lib/modules/invoices/usecases/changeInvoiceStatus/changeInvoiceStatus';
import { ChangeInvoiceStatusResponse } from './../../../../../../src/lib/modules/invoices/usecases/changeInvoiceStatus/changeInvoiceStatusResponse';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockArticleRepo: MockArticleRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let response: ChangeInvoiceStatusResponse;

let useCase: ChangeInvoiceStatus;

Before({ tags: '@ValidateChangeInvoice' }, function () {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockArticleRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
  useCase = new ChangeInvoiceStatus(mockInvoiceRepo);
});

Given(
  /^There is an Invoice with an existing ID "([\w-]+)"$/,
  async function (testInvoiceId: string) {
    const invoice = InvoiceMap.toDomain({
      transactionId: 'transaction-id',
      dateCreated: new Date(),
      id: testInvoiceId,
    });

    if (invoice.isLeft()) {
      throw invoice.value;
    }

    mockInvoiceRepo.save(invoice.value);
  }
);

Given(
  /^There is an Invoice with a non-existing ID "([\w-]+)"$/,
  async function (testInvoiceId: string) {
    return;
  }
);

When(
  /I try update the status for the Invoice with ID "([\w-]+)" to (.+)/,
  async function (testInvoiceId, status: string) {
    response = await useCase.execute({
      invoiceId: testInvoiceId,
      status,
    });
  }
);

Then(
  /The Invoice with ID "([\w-]+)" is successfully updated to (.+)/,
  async function (testInvoiceId: string, status: string) {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));

    const invoice = await mockInvoiceRepo.getInvoiceById(invoiceId);

    if (invoice.isLeft()) {
      throw invoice.value;
    }

    expect(invoice.value.status).to.equal(status);
  }
);

Then('An InvoiceNotFoundError error is returned', function () {
  expect(response.isLeft()).to.equal(true);
});
