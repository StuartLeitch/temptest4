import { expect } from 'chai';
import { Given, When, Then, BeforeAll } from 'cucumber';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/domain/authorization';

// * Domain imports
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { TransactionId } from '../../../../../../src/lib/modules/transactions/domain/TransactionId';
import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { CatalogMap } from '../../../../../../src/lib/modules/journals/mappers/CatalogMap';

// * Usecases imports
import { CreateTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/createTransaction/createTransaction';
import { CreateTransactionResponse } from '../../../../../../src/lib/modules/transactions/usecases/createTransaction/createTransactionResponse';

// * Mock repos imports
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockEditorRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { WaiverService } from '../../../../../../src/lib/domain/services/WaiverService';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

const mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
const mockInvoiceItemRepo: MockInvoiceItemRepo = new MockInvoiceItemRepo();
const mockCatalogRepo: MockCatalogRepo = new MockCatalogRepo();
const mockPausedReminderRepo = new MockPausedReminderRepo();
const mockWaiverRepo = new MockWaiverRepo();
const mockEditorRepo = new MockEditorRepo();
const mockManuscriptRepo = new MockArticleRepo();
const waiverService = new WaiverService(
  mockInvoiceItemRepo,
  mockEditorRepo,
  mockWaiverRepo
);
let result: CreateTransactionResponse;

let journalId;
let manuscriptId;
let price;
let transactionId: TransactionId;
let invoiceId: InvoiceId;

const usecase: CreateTransactionUsecase = new CreateTransactionUsecase(
  mockPausedReminderRepo,
  mockInvoiceItemRepo,
  mockTransactionRepo,
  mockManuscriptRepo,
  mockCatalogRepo,
  mockInvoiceRepo,
  waiverService
);

Given(
  /^A journal "([\w-]+)" with the APC of (\d+)$/,
  (journalTestId: string, priceTest: number) => {
    journalId = journalTestId;
    price = priceTest;
    const catalogItem = CatalogMap.toDomain({
      journalId,
      type: 'APC',
      amount: price,
      // journalTile: 'manuscript-title',
    });
    mockCatalogRepo.save(catalogItem);
  }
);

When(
  /^CreateTransactionUsecase is executed for manuscript "([\w-]+)"$/,
  async (manuscriptTestId: string) => {
    manuscriptId = manuscriptTestId;
    result = await usecase.execute(
      {
        manuscriptId,
        journalId,
      },
      defaultContext
    );
  }
);

Then('A DRAFT Transaction should be created', async () => {
  expect(result.isRight).to.equal(true);

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

Then(
  /^The Invoice Item should have a price attached equal to (\d+)$/,
  async (invoiceItemTestPrice: number) => {
    const lastSavedInvoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
    expect(lastSavedInvoiceItems.length).to.equal(1);
    expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).to.equal(
      invoiceId.id.toString()
    );
    expect(lastSavedInvoiceItems[0].price).to.equal(invoiceItemTestPrice);
  }
);
