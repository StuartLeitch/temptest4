import { Before, Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from 'chai';

import { UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';
import { MockLogger } from './../../../../../../src/lib/infrastructure/logging';

import { MockSqsPublishService } from './../../../../../../src/lib/domain/services/SQSPublishService';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { WaiverType } from '../../../../../../src/lib/modules/waivers/domain/Waiver';
import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';

import { ManuscriptMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ManuscriptMap';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { WaiverMap } from '../../../../../../src/lib/modules/waivers/mappers/WaiverMap';

import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockCouponRepo } from './../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from './../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';

import { GenerateDraftCompensatoryEventsUsecase } from '../../../../../../src/lib/modules/invoices/usecases/generateDraftCompensatoryEvents';

const defaultUsecaseContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

interface Context {
  repos: {
    invoiceItem: MockInvoiceItemRepo;
    manuscript: MockArticleRepo;
    invoice: MockInvoiceRepo;
    coupon: MockCouponRepo;
    waiver: MockWaiverRepo;
  };
  services: {
    queueService: MockSqsPublishService;
    logger: MockLogger;
  };
}

const tag = { tags: '@GenerateDraftCompensatoryEvents' };

const submissionDate = '2020-10-15T14:25:13';
const updateDate = '2020-10-17T14:25:13';

let usecase: GenerateDraftCompensatoryEventsUsecase = null;
let context: Context = null;

Before(tag, () => {
  const invoiceItem = new MockInvoiceItemRepo();
  const manuscript = new MockArticleRepo();
  const invoice = new MockInvoiceRepo(manuscript, invoiceItem);
  const coupon = new MockCouponRepo();
  const waiver = new MockWaiverRepo();

  const queueService = new MockSqsPublishService();
  const logger = new MockLogger();

  context = {
    repos: {
      invoiceItem,
      manuscript,
      invoice,
      coupon,
      waiver,
    },
    services: {
      queueService,
      logger,
    },
  };

  usecase = new GenerateDraftCompensatoryEventsUsecase(
    invoiceItem,
    manuscript,
    invoice,
    coupon,
    waiver,
    queueService,
    logger
  );
});

After(tag, () => {
  context = null;
  usecase = null;
});

Given(/^A manuscript with custom id "([\w\d]+)"$/, (customId: string) => {
  const manuscript = ManuscriptMap.toDomain({
    id: customId,
    customId,
  });

  context.repos.manuscript.addMockItem(manuscript);
});

Given(
  /^An invoice with id "([\w\d-]+)" for manuscript "([\w\d]+)" with price "([\d]+)"$/,
  (invoiceId: string, manuscriptId: string, price: string) => {
    const invoice = InvoiceMap.toDomain({
      transactionId: 'transaction-1',
      dateCreated: submissionDate,
      status: 'DRAFT',
      id: invoiceId,
    });
    const invoiceItem = InvoiceItemMap.toDomain({
      invoiceId,
      manuscriptId,
      price: Number.parseFloat(price),
    });

    context.repos.invoiceItem.addMockItem(invoiceItem);
    context.repos.invoice.addMockItem(invoice);
  }
);

When(
  /^GenerateDraftCompensatoryEvents is called for invoiceId "([\w-]+)"$/,
  async (invoiceId: string) => {
    const maybeResult = await usecase.execute(
      { invoiceId },
      defaultUsecaseContext
    );

    if (maybeResult.isLeft()) {
      throw maybeResult.value;
    }
  }
);

Then(
  /^An event of type "([\w]+)" is generated, for invoiceId "([\w\d-]+)"$/,
  (eventName: string, invoiceId: string) => {
    const event = context.services.queueService.findEvent(eventName);
    expect(event).to.be.ok;
    expect(event.data.invoiceId).to.be.equal(invoiceId);
  }
);

Given(
  /^A waiver applied at "([\w]+)" on invoiceId "([\w\d-]+)"$/,
  async (moment: string, id: string) => {
    let dateOfWaiver = '';
    if (moment === 'Submission') {
      dateOfWaiver = submissionDate;
    } else {
      dateOfWaiver = updateDate;
    }

    const waiver = WaiverMap.toDomain({
      type_id: WaiverType.EDITOR_DISCOUNT,
      reduction: 50,
      isActive: true,
    });

    const invoiceId = InvoiceId.create(new UniqueEntityID(id)).getValue();
    const [invoiceItem] = await context.repos.invoiceItem.getItemsByInvoiceId(
      invoiceId
    );

    context.repos.waiver.addMockWaiverForInvoiceItem(
      waiver,
      invoiceItem.invoiceItemId,
      new Date(dateOfWaiver)
    );
  }
);

Then(
  /^"([\w]+)" event has "([\d]+)" waivers in message and reduction calculated$/,
  (eventName: string, waiverCount: string) => {
    const event = context.services.queueService.findEvent(eventName);
    expect(event).to.be.ok;
    expect(event.data.invoiceItems[0].waivers.length).to.be.equal(
      Number.parseInt(waiverCount)
    );
  }
);

Given(/^Invoice with id "([\w\d-]+)" is deleted$/, async (id: string) => {
  const invoiceId = InvoiceId.create(new UniqueEntityID(id)).getValue();
  const invoice = await context.repos.invoice.getInvoiceById(invoiceId);
  await context.repos.invoice.delete(invoice);
});
