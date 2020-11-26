/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { Before, Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from 'chai';

import { SubmissionSubmitted } from '@hindawi/phenom-events';

import { MockLogger } from '../../../../../libs/shared/src/lib/infrastructure/logging/mocks/MockLogger';
import { UsecaseAuthorizationContext } from '../../../../../libs/shared/src/lib/domain/authorization';
import { WaiverService } from '../../../../../libs/shared/src/lib/domain/services/WaiverService';

import { Manuscript } from '../../../../../libs/shared/src/lib/modules/manuscripts/domain/Manuscript';
import { InvoiceStatus } from '../../../../../libs/shared/src/lib/modules/invoices/domain/Invoice';
import { WaiverType } from '../../../../../libs/shared/src/lib/modules/waivers/domain/Waiver';
import { Roles } from '../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import { MockPausedReminderRepo } from '../../../../../libs/shared/src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockTransactionRepo } from '../../../../../libs/shared/src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceItemRepo } from '../../../../../libs/shared/src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from '../../../../../libs/shared/src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockCatalogRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockInvoiceRepo } from '../../../../../libs/shared/src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockEditorRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockCouponRepo } from '../../../../../libs/shared/src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../libs/shared/src/lib/modules/waivers/repos/mocks/mockWaiverRepo';

import { TransactionMap } from '../../../../../libs/shared/src/lib/modules/transactions/mappers/TransactionMap';
import { ManuscriptMap } from '../../../../../libs/shared/src/lib/modules/manuscripts/mappers/ManuscriptMap';
import { InvoiceItemMap } from '../../../../../libs/shared/src/lib/modules/invoices/mappers/InvoiceItemMap';
import { ArticleMap } from '../../../../../libs/shared/src/lib/modules/manuscripts/mappers/ArticleMap';
import { CatalogMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';
import { InvoiceMap } from '../../../../../libs/shared/src/lib/modules/invoices/mappers/InvoiceMap';
import { EditorMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/EditorMap';
import { WaiverMap } from '../../../../../libs/shared/src/lib/modules/waivers/mappers/WaiverMap';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { SoftDeleteDraftTransactionUsecase } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';
import { GetItemsForInvoiceUsecase } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceDetails';

import { Context } from '../../../src/builders';

import { SubmissionSubmittedHandler as Handler } from '../../../src/queue_service/handlers/submission-submitted/SubmissionSubmitted';

interface MockContext {
  repos: {
    pausedReminder: MockPausedReminderRepo;
    invoiceItem: MockInvoiceItemRepo;
    transaction: MockTransactionRepo;
    manuscript: MockArticleRepo;
    catalog: MockCatalogRepo;
    invoice: MockInvoiceRepo;
    coupon: MockCouponRepo;
    editor: MockEditorRepo;
    waiver: MockWaiverRepo;
  };
  services: {
    waiverService: WaiverService;
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
    editor: null,
    waiver: null,
  },
  services: {
    waiverService: null,
    logger: null,
  },
};

const defaultUsecaseContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

let submittingManuscript: Manuscript = null;
let event: SubmissionSubmitted = null;

Before(() => {
  context.repos.pausedReminder = new MockPausedReminderRepo();
  context.repos.invoiceItem = new MockInvoiceItemRepo();
  context.repos.transaction = new MockTransactionRepo();
  context.repos.manuscript = new MockArticleRepo();
  context.repos.catalog = new MockCatalogRepo();
  context.repos.invoice = new MockInvoiceRepo(
    context.repos.manuscript,
    context.repos.invoiceItem
  );
  context.repos.coupon = new MockCouponRepo();
  context.repos.editor = new MockEditorRepo();
  context.repos.waiver = new MockWaiverRepo();

  context.services.logger = new MockLogger();
  context.services.waiverService = new WaiverService(
    context.repos.invoiceItem,
    context.repos.editor,
    context.repos.waiver
  );

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
      editor: null,
      waiver: null,
    },
    services: {
      waiverService: null,
      logger: null,
    },
  };
});

Given(
  /^There is a Journal "([\w-]+)" with APC "([\d]+)"$/,
  async (journalId: string, apc: string) => {
    const journal = CatalogMap.toDomain({
      journalId,
      journalTitle: journalId,
      id: journalId,
      type: 'mock',
      amount: Number.parseFloat(apc),
    });

    context.repos.catalog.addMockItem(journal);
  }
);

Given(
  /^A "([\w\s]+)" with CustomId "([\w\d]+)" is submitted on journal "([\w-]+)"$/,
  async (articleType: string, customId: string, journalId: string) => {
    submittingManuscript = ManuscriptMap.toDomain({
      articleType,
      journalId,
      customId,
    });
  }
);

When(`The "Submission Submitted" event is triggered`, async () => {
  event = {
    submissionId: submittingManuscript.customId,
    manuscripts: [
      {
        journalId: submittingManuscript.journalId,
        articleType: { name: submittingManuscript.articleType },
        customId: submittingManuscript.customId,
        authors: [
          {
            email: submittingManuscript.authorEmail,
            isCorresponding: true,
          },
        ],
      },
    ],
  } as SubmissionSubmitted;
  await Handler.handler((context as unknown) as Context)(event);
});

Then(
  /^The invoice for CustomId "([\w\d]+)" is created$/,
  async (customId: string) => {
    const invoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      context.repos.manuscript,
      context.repos.invoiceItem
    );

    const maybeInvoiceId = await invoiceIdUsecase.execute(
      { customId },
      defaultUsecaseContext
    );

    expect(maybeInvoiceId.isRight()).to.be.true;
    expect(maybeInvoiceId.value.getValue()).to.be.ok;
  }
);

Then(
  /^The invoice for CustomId "([\w\d]+)" has price "([\d]+)"$/,
  async (customId: string, price: string) => {
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

    const maybeInvoiceId = await invoiceIdUsecase.execute(
      { customId },
      defaultUsecaseContext
    );

    if (maybeInvoiceId.isLeft()) {
      throw maybeInvoiceId.value;
    }
    expect(maybeInvoiceId.isRight()).to.be.true;

    const invoiceId = maybeInvoiceId.value.getValue()[0].id.toString();

    const maybeInvoice = await invoiceUsecase.execute(
      { invoiceId },
      defaultUsecaseContext
    );

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }
    expect(maybeInvoice.isRight()).to.be.true;

    const invoice = maybeInvoice.value.getValue();

    const maybeInvoiceItems = await invoiceItemsUsecase.execute(
      { invoiceId },
      defaultUsecaseContext
    );

    if (maybeInvoiceItems.isLeft()) {
      throw maybeInvoiceItems.value;
    }
    expect(maybeInvoiceItems.isRight()).to.be.true;

    invoice.addItems(maybeInvoiceItems.value.getValue());

    expect(invoice.invoiceTotal).to.equal(Number.parseFloat(price));
  }
);

Then(
  /^The invoice for CustomId "([\w\d]+)" is not created$/,
  async (customId: string) => {
    const article = await context.repos.manuscript.findByCustomId(customId);
    expect(article).to.be.null;
  }
);

Given(
  /^A "([\w\s]+)" with CustomId "([\w\d]+)" is on "([\w-]+)"$/,
  async (articleType: string, customId: string, journalId: string) => {
    const article = ArticleMap.toDomain({
      articleType,
      journalId,
      customId,
      id: customId,
    });

    const transaction = TransactionMap.toDomain({
      status: 'DRAFT',
    });

    const invoice = InvoiceMap.toDomain({
      transactionId: transaction.id.toString(),
      status: 'DRAFT',
    });

    const invoiceItem = InvoiceItemMap.toDomain({
      manuscriptId: article.id.toString(),
      invoiceId: invoice.id.toString(),
      price: 200,
    });

    context.repos.invoiceItem.addMockItem(invoiceItem);
    context.repos.transaction.addMockItem(transaction);
    context.repos.manuscript.addMockItem(article);
    context.repos.invoice.addMockItem(invoice);
  }
);

Then(
  /^The invoice for CustomId "([\w\d]+)" is deleted$/,
  async (customId: string) => {
    const index = context.repos.manuscript.deletedItems.findIndex(
      (item) => item.customId === customId
    );

    expect(index).to.not.equal(-1);
  }
);

Given(
  /^Article with CustomId "([\w\d]+)" is deleted$/,
  async (customId: string) => {
    const usecase = new SoftDeleteDraftTransactionUsecase(
      context.repos.transaction,
      context.repos.invoiceItem,
      context.repos.invoice,
      context.repos.manuscript
    );

    const maybeResult = await usecase.execute(
      { manuscriptId: customId },
      defaultUsecaseContext
    );

    if (maybeResult.isLeft()) {
      throw maybeResult.value;
    }
  }
);

Then(
  /^The invoice for CustomId "([\w\d]+)" is restored$/,
  async (customId: string) => {
    expect(context.repos.invoiceItem.deletedItems.length).to.be.equal(0);
    expect(context.repos.transaction.deletedItems.length).to.be.equal(0);
    expect(context.repos.manuscript.deletedItems.length).to.be.equal(0);
    expect(context.repos.invoice.deletedItems.length).to.be.equal(0);
  }
);

Given(
  /^There is an editor for Journal "([\w-]+)" with email "([\w_.@]+)"$/,
  async (journalId: string, email: string) => {
    const editor = EditorMap.toDomain({
      journalId,
      email,
      roleLabel: 'Academic Editor',
      roleType: 'academicEditor',
      name: 'test',
    });

    context.repos.editor.addMockItem(editor);
  }
);

Given('There is a waiver for editors', async () => {
  const waiver = WaiverMap.toDomain({
    type_id: WaiverType.EDITOR_DISCOUNT,
    reduction: 50,
    isActive: true,
  });
  context.repos.waiver.addMockItem(waiver);
});

Given(
  /^The corresponding author has email "([\w_.@]+)"$/,
  async (email: string) => {
    submittingManuscript.authorEmail = email;
  }
);

Then(
  /^The invoice for CustomId "([\w\d]+)" has "([\d]+)" waivers applied$/,
  async (customId: string, count: string) => {
    const waiversCount = Number.parseInt(count);

    const invoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      context.repos.manuscript,
      context.repos.invoiceItem
    );
    const invoiceItemsUsecase = new GetItemsForInvoiceUsecase(
      context.repos.invoiceItem,
      context.repos.coupon,
      context.repos.waiver
    );

    const maybeInvoiceId = await invoiceIdUsecase.execute(
      { customId },
      defaultUsecaseContext
    );

    if (maybeInvoiceId.isLeft()) {
      throw maybeInvoiceId.value;
    }
    expect(maybeInvoiceId.isRight()).to.be.true;

    const invoiceId = maybeInvoiceId.value.getValue()[0].id.toString();

    const maybeInvoiceItems = await invoiceItemsUsecase.execute(
      { invoiceId },
      defaultUsecaseContext
    );

    if (maybeInvoiceItems.isLeft()) {
      throw maybeInvoiceItems.value;
    }
    expect(maybeInvoiceItems.isRight()).to.be.true;

    const items = maybeInvoiceItems.value.getValue();

    expect(items[0].assignedWaivers.length).to.equal(waiversCount);
  }
);

Then(
  /^The invoice for CustomId "([\w\d]+)" remains in DRAFT state$/,
  async (customId: string) => {
    const invoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      context.repos.manuscript,
      context.repos.invoiceItem
    );
    const invoiceUsecase = new GetInvoiceDetailsUsecase(context.repos.invoice);

    const maybeInvoiceId = await invoiceIdUsecase.execute(
      { customId },
      defaultUsecaseContext
    );

    if (maybeInvoiceId.isLeft()) {
      throw maybeInvoiceId.value;
    }
    expect(maybeInvoiceId.isRight()).to.be.true;

    const invoiceId = maybeInvoiceId.value.getValue()[0].id.toString();

    const maybeInvoice = await invoiceUsecase.execute(
      { invoiceId },
      defaultUsecaseContext
    );

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }
    expect(maybeInvoice.isRight()).to.be.true;

    const invoice = maybeInvoice.value.getValue();

    expect(invoice.status).to.be.equal(InvoiceStatus.DRAFT);
  }
);

Given(
  /^Invoice for article with CustomId "([\w\d]+)" has waiver applied$/,
  async (customId: string) => {
    const manuscript = await context.repos.manuscript.findByCustomId(customId);
    const [item] = await context.repos.invoiceItem.getInvoiceItemByManuscriptId(
      manuscript.manuscriptId
    );
    const waiver = await context.repos.waiver.getWaiverByType(
      WaiverType.EDITOR_DISCOUNT
    );
    context.repos.waiver.addMockWaiverForInvoiceItem(
      waiver,
      item.invoiceItemId
    );
  }
);
