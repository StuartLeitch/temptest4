import { Before, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';

import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../src/lib/domain/authorization';

// * Domain imports
import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { TransactionId } from '../../../../../../src/lib/modules/transactions/domain/TransactionId';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';

import { ManuscriptMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ManuscriptMap';
import { CatalogMap } from '../../../../../../src/lib/modules/journals/mappers/CatalogMap';

// * Mock repos imports
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockEditorRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { WaiverService } from '../../../../../../src/lib/domain/services/WaiverService';

// * Usecases imports
import { CreateTransactionResponse } from '../../../../../../src/lib/modules/transactions/usecases/createTransaction/createTransactionResponse';
import { CreateTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/createTransaction/createTransaction';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

interface Context {
  repos: {
    pausedReminder: MockPausedReminderRepo;
    invoiceItem: MockInvoiceItemRepo;
    transaction: MockTransactionRepo;
    manuscript: MockArticleRepo;
    catalog: MockCatalogRepo;
    invoice: MockInvoiceRepo;
    editor: MockEditorRepo;
    waiver: MockWaiverRepo;
  };
  services: {
    waiverService: WaiverService;
  };
}

const context: Context = {
  repos: {
    pausedReminder: null,
    invoiceItem: null,
    transaction: null,
    manuscript: null,
    catalog: null,
    invoice: null,
    editor: null,
    waiver: null,
  },
  services: {
    waiverService: null,
  },
};

let result: CreateTransactionResponse;

let transactionId: TransactionId;
let invoiceId: InvoiceId;

let usecase: CreateTransactionUsecase = null;

Before({ tags: '@ValidateCreateTransaction' }, () => {
  context.repos.pausedReminder = new MockPausedReminderRepo();
  context.repos.invoiceItem = new MockInvoiceItemRepo();
  context.repos.transaction = new MockTransactionRepo();
  context.repos.manuscript = new MockArticleRepo();
  context.repos.catalog = new MockCatalogRepo();
  context.repos.invoice = new MockInvoiceRepo();
  context.repos.editor = new MockEditorRepo();
  context.repos.waiver = new MockWaiverRepo();

  context.services.waiverService = new WaiverService(
    context.repos.invoiceItem,
    context.repos.editor,
    context.repos.waiver
  );

  usecase = new CreateTransactionUsecase(
    context.repos.pausedReminder,
    context.repos.invoiceItem,
    context.repos.transaction,
    context.repos.manuscript,
    context.repos.catalog,
    context.repos.invoice,
    context.services.waiverService
  );
});

Given(
  /^A journal "([\w-]+)" with the APC of (\d+)$/,
  (journalId: string, price: number) => {
    const catalogItem = CatalogMap.toDomain({
      journalId,
      amount: price,
      type: 'APC',
    });

    if (catalogItem.isLeft()) {
      throw catalogItem.value;
    }

    context.repos.catalog.addMockItem(catalogItem.value);
  }
);

Given(
  /^A manuscript with id "([\w-]+)" is on journal "foo-journal"$/,
  (manuscriptId: string) => {
    const manuscript = ManuscriptMap.toDomain({
      customId: manuscriptId,
      title: manuscriptId,
      id: manuscriptId,
    });

    if (manuscript.isLeft()) {
      throw manuscript.value;
    }

    context.repos.manuscript.addMockItem(manuscript.value);
  }
);

When(
  /^CreateTransactionUsecase is executed for manuscript "([\w-]+)" on journal "([\w-]+)"$/,
  async (manuscriptId: string, journalId: string) => {
    result = await usecase.execute(
      {
        authorsEmails: ['test@test.com'],
        manuscriptId,
        journalId,
      },
      defaultContext
    );
  }
);

Then('A DRAFT Transaction should be created', async () => {
  expect(result.isRight()).to.equal(true);

  const maybeLastSavedTransactions = await context.repos.transaction.getTransactionCollection();

  if (maybeLastSavedTransactions.isLeft()) {
    throw maybeLastSavedTransactions.value;
  }

  const lastSavedTransactions = maybeLastSavedTransactions.value;

  expect(lastSavedTransactions.length).to.equal(1);
  expect(lastSavedTransactions[0].status).to.equal(TransactionStatus.DRAFT);
  transactionId = lastSavedTransactions[0].transactionId;
});

Then('A DRAFT Invoice should be created', async () => {
  const lastSavedInvoices = await context.repos.invoice.getInvoiceCollection();

  expect(lastSavedInvoices.length).to.equal(1);
  expect(lastSavedInvoices[0].status).to.equal(InvoiceStatus.DRAFT);
  expect(lastSavedInvoices[0].transactionId.id.toString()).to.equal(
    transactionId.id.toString()
  );
  invoiceId = lastSavedInvoices[0].invoiceId;
});

Then('An Invoice Item should be created', async () => {
  const maybeLastSavedInvoiceItems = await context.repos.invoiceItem.getInvoiceItemCollection();

  if (maybeLastSavedInvoiceItems.isLeft()) {
    throw maybeLastSavedInvoiceItems.value;
  }

  const lastSavedInvoiceItems = maybeLastSavedInvoiceItems.value;

  expect(lastSavedInvoiceItems.length).to.equal(1);
  expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).to.equal(
    invoiceId.id.toString()
  );
});

Then(
  /^The Invoice Item should have a price attached equal to (\d+)$/,
  async (invoiceItemTestPrice: number) => {
    const maybeLastSavedInvoiceItems = await context.repos.invoiceItem.getInvoiceItemCollection();

    if (maybeLastSavedInvoiceItems.isLeft()) {
      throw maybeLastSavedInvoiceItems.value;
    }

    const lastSavedInvoiceItems = maybeLastSavedInvoiceItems.value;

    expect(lastSavedInvoiceItems.length).to.equal(1);
    expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).to.equal(
      invoiceId.id.toString()
    );
    expect(lastSavedInvoiceItems[0].price).to.equal(invoiceItemTestPrice);
  }
);
