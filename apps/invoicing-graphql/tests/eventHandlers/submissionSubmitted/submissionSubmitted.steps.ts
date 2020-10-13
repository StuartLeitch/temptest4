/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { Before, Given, When, Then, After } from 'cucumber';
import { expect } from 'chai';

import { SubmissionSubmitted } from '@hindawi/phenom-events';

import { Manuscript } from '../../../../../libs/shared/src/lib/modules/manuscripts/domain/Manuscript';

import { MockPausedReminderRepo } from '../../../../../libs/shared/src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockTransactionRepo } from '../../../../../libs/shared/src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceItemRepo } from '../../../../../libs/shared/src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from '../../../../../libs/shared/src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockCatalogRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockInvoiceRepo } from '../../../../../libs/shared/src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockCouponRepo } from '../../../../../libs/shared/src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../libs/shared/src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockLogger } from '../../../../../libs/shared/src/lib/infrastructure/logging/mocks/MockLogger';

import { ManuscriptMap } from '../../../../../libs/shared/src/lib/modules/manuscripts/mappers/ManuscriptMap';
import { CatalogMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetItemsForInvoiceUsecase } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceDetails';

import { Context } from '../../../src/builders';

import { SubmissionSubmittedHandler as Handler } from '../../../src/queue_service/handlers/SubmissionSubmitted';

interface MockContext {
  repos: {
    pausedReminder: MockPausedReminderRepo;
    invoiceItem: MockInvoiceItemRepo;
    transaction: MockTransactionRepo;
    manuscript: MockArticleRepo;
    catalog: MockCatalogRepo;
    invoice: MockInvoiceRepo;
    coupon: MockCouponRepo;
    waiver: MockWaiverRepo;
  };
  services: {
    logger: MockLogger;
  };
}

let context: MockContext = {
  repos: {
    pausedReminder: null,
    invoiceItem: null,
    transaction: null,
    manuscript: null,
    catalog: null,
    invoice: null,
    coupon: null,
    waiver: null,
  },
  services: {
    logger: null,
  },
};

let submittingManuscript: Manuscript = null;
let event: SubmissionSubmitted = null;

Before(() => {
  context.repos.pausedReminder = new MockPausedReminderRepo();
  context.repos.invoiceItem = new MockInvoiceItemRepo();
  context.repos.transaction = new MockTransactionRepo();
  context.repos.manuscript = new MockArticleRepo();
  context.repos.catalog = new MockCatalogRepo();
  context.repos.invoice = new MockInvoiceRepo();
  context.repos.coupon = new MockCouponRepo();
  context.repos.waiver = new MockWaiverRepo();

  context.services.logger = new MockLogger();

  submittingManuscript = null;
  event = null;
});

After(() => {
  context = {
    repos: {
      pausedReminder: null,
      invoiceItem: null,
      transaction: null,
      manuscript: null,
      catalog: null,
      invoice: null,
      coupon: null,
      waiver: null,
    },
    services: {
      logger: null,
    },
  };
});

Given(
  /^There is a Journal "([\w-]+)" with APC "([\d]+)"$/,
  async (journalId: string, apc: number) => {
    const journal = CatalogMap.toDomain({
      journalId,
      journalTitle: journalId,
      id: journalId,
      type: 'mock',
      amount: apc,
    });

    context.repos.catalog.addMockItem(journal);
  }
);

Given(
  /^There is no article with CustomId "([\w\d]+)"$/,
  async (customId: string) => {
    const manuscript = await context.repos.manuscript.findByCustomId(customId);
    if (manuscript) {
      await context.repos.manuscript.delete(manuscript);
    }
  }
);

Given(
  /^An article with CustomId "([\w\d]+)" is submitted$/,
  async (customId: string) => {
    submittingManuscript = ManuscriptMap.toDomain({
      customId,
    });
  }
);

Given(
  /^The submitting articleType is "([\w]+)"$/,
  async (articleType: string) => {
    expect(submittingManuscript).to.be.ok;
    submittingManuscript.articleType = articleType;
  }
);

When(`The "Submission Submitted" event is triggered`, async () => {
  await Handler.handler((context as unknown) as Context)(event);
});

Then(
  /^The invoice for CustomId "([\w\d]+)" is created and has price "([\d]+)"$/,
  async (customId: string, price: number) => {
    const invoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      context.repos.manuscript,
      context.repos.invoiceItem
    );
    const invoiceUsecase = new GetInvoiceDetailsUsecase(context.repos.invoice);
    const invoiceItemsUsecase = new GetItemsForInvoiceUsecase(
      context.repos.invoiceItem,
      context.repos.coupon,
      context.repos.waiver
    );

    const maybeInvoiceId = await invoiceIdUsecase.execute({ customId });

    expect(maybeInvoiceId.isRight()).to.be.true;
    if (maybeInvoiceId.isLeft()) {
      throw maybeInvoiceId.value;
    }
    const invoiceId = maybeInvoiceId.value.getValue()[0].id.toString();

    const maybeInvoice = await invoiceUsecase.execute({ invoiceId });

    expect(maybeInvoice.isRight()).to.be.true;
    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    const invoice = maybeInvoice.value.getValue();

    const maybeInvoiceItems = await invoiceItemsUsecase.execute({ invoiceId });
    expect(maybeInvoiceItems.isRight()).to.be.true;
    if (maybeInvoiceItems.isLeft()) {
      throw maybeInvoiceItems.value;
    }

    invoice.addItems(maybeInvoiceItems.value.getValue());

    expect(invoice.invoiceTotal).to.equal(price);
  }
);
