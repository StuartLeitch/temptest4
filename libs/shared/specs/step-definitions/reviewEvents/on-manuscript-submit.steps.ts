import { expect } from 'chai';
import { Given, When, Then, BeforeAll } from 'cucumber';

import { Roles } from '../../../src/lib/modules/users/domain/enums/Roles';

// * Domain imports
import { InvoiceStatus } from '../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceId } from './../../../src/lib/modules/invoices/domain/InvoiceId';
import { TransactionId } from './../../../src/lib/modules/transactions/domain/TransactionId';
import { TransactionStatus } from '../../../src/lib/modules/transactions/domain/Transaction';
import { CatalogMap } from './../../../src/lib/modules/journals/mappers/CatalogMap';

// * Usecases imports
import {
  CreateTransactionContext,
  CreateTransactionUsecase,
} from '../../../src/lib/modules/transactions/usecases/createTransaction/createTransaction';
import { CreateTransactionResponse } from './../../../src/lib/modules/transactions/usecases/createTransaction/createTransactionResponse';

// * Mock repos imports
import { MockTransactionRepo } from '../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceRepo } from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from './../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockCatalogRepo } from './../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockPausedReminderRepo } from '../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';

const defaultContext: CreateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

const mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
const mockInvoiceItemRepo: MockInvoiceItemRepo = new MockInvoiceItemRepo();
const mockCatalogRepo: MockCatalogRepo = new MockCatalogRepo();
const mockPausedReminderRepo = new MockPausedReminderRepo();
let result: CreateTransactionResponse;

const manuscriptId = 'manuscript-id';
const journalId = 'journal-id';
const price = 666;

let transactionId: TransactionId;
let invoiceId: InvoiceId;

const usecase: CreateTransactionUsecase = new CreateTransactionUsecase(
  mockTransactionRepo,
  mockInvoiceRepo,
  mockInvoiceItemRepo,
  mockCatalogRepo,
  mockPausedReminderRepo
);
BeforeAll(function () {
  const catalogItem = CatalogMap.toDomain({
    journalId,
    type: 'APC',
    amount: price,
    journalTile: 'manuscript-title',
  });
  mockCatalogRepo.save(catalogItem);
});

Given('Invoicing listening to submit events emitted by Review', () => {
  return;
});

When('A manuscript submit event is published', async () => {
  result = await usecase.execute(
    {
      manuscriptId,
      journalId,
    },
    defaultContext
  );
});

Then('A DRAFT Transaction should be created', async () => {
  expect(result.value.isSuccess).to.equal(true);

  const lastSavedTransactions = await mockTransactionRepo.getTransactionCollection();

  expect(lastSavedTransactions.length).to.equal(1);
  expect(lastSavedTransactions[0].status).to.equal(TransactionStatus.DRAFT);
  transactionId = lastSavedTransactions[0].transactionId;
});

Then('A DRAFT Invoice should be created', async () => {
  const lastSavedInvoices = await mockInvoiceRepo.getInvoiceCollection();

  expect(lastSavedInvoices.length).to.equal(1);
  expect(lastSavedInvoices[0].status).to.equal(InvoiceStatus.DRAFT);
  expect(lastSavedInvoices[0].transactionId.id.toString()).to.equal(
    transactionId.id.toString()
  );
  invoiceId = lastSavedInvoices[0].invoiceId;
});

Then('An Invoice Item should be created', async () => {
  const lastSavedInvoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();

  expect(lastSavedInvoiceItems.length).to.equal(1);
  expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).to.equal(
    invoiceId.id.toString()
  );
});

Then('The Invoice Item should have a price attached', async () => {
  const lastSavedInvoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
  expect(lastSavedInvoiceItems.length).to.equal(1);
  expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).to.equal(
    invoiceId.id.toString()
  );
  expect(lastSavedInvoiceItems[0].price).to.equal(price);
});
