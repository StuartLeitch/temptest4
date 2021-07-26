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
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

import { GenerateDraftCompensatoryEventsUsecase } from '../../../../../../src/lib/modules/invoices/usecases/generateDraftCompensatoryEvents';

const defaultUsecaseContext: UsecaseAuthorizationContext = {
  roles: [Roles.SERVICE],
};

interface Context {
  repos: {
    invoiceItem: MockInvoiceItemRepo;
    manuscript: MockArticleRepo;
    invoice: MockInvoiceRepo;
    coupon: MockCouponRepo;
    waiver: MockWaiverRepo;
    erpReference: MockErpReferenceRepo;
  };
  services: {
    queueService: MockSqsPublishService;
    logger: MockLogger;
  };
}

const tag = { tags: '@GenerateDraftCompensatoryEvents' };

const invoiceAcceptanceDate = '2020-10-20T14:25:13';
const waiverAcceptanceDate = '2020-10-20T14:25:14';
const submissionDate = '2020-10-15T14:25:13';
const updateDate = '2020-10-17T14:25:13';

let usecase: GenerateDraftCompensatoryEventsUsecase = null;
let context: Context = null;

Before(tag, () => {
  const invoiceItem = new MockInvoiceItemRepo();
  const manuscript = new MockArticleRepo();
  const erpReference = new MockErpReferenceRepo();
  const invoice = new MockInvoiceRepo(manuscript, invoiceItem, erpReference);
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
      erpReference,
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

  if (manuscript.isLeft()) {
    throw manuscript.value;
  }

  context.repos.manuscript.addMockItem(manuscript.value);
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

    if (invoice.isLeft()) {
      throw invoice.value;
    }

    const invoiceItem = InvoiceItemMap.toDomain({
      invoiceId,
      manuscriptId,
      price: Number.parseFloat(price),
    });

    if (invoiceItem.isLeft()) {
      throw invoiceItem.value;
    }

    context.repos.invoiceItem.addMockItem(invoiceItem.value);
    context.repos.invoice.addMockItem(invoice.value);
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

Then(
  /^An event of type "([\w]+)" is NOT generated, for invoiceId "([\w\d-]+)"$/,
  (eventName: string, invoiceId: string) => {
    const event = context.services.queueService.findEvent(eventName);
    expect(event).to.not.be.ok;
  }
);

Given(
  /^A waiver applied at "([\w]+)" on invoiceId "([\w\d-]+)"$/,
  async (moment: string, id: string) => {
    let dateOfWaiver = '';
    if (moment === 'Submission') {
      dateOfWaiver = submissionDate;
    } else if (moment === 'Acceptance') {
      dateOfWaiver = waiverAcceptanceDate;
    } else {
      dateOfWaiver = updateDate;
    }

    const waiver = WaiverMap.toDomain({
      type_id: WaiverType.EDITOR_DISCOUNT,
      reduction: 50,
      isActive: true,
    });

    if (waiver.isLeft()) {
      throw waiver.value;
    }

    const invoiceId = InvoiceId.create(new UniqueEntityID(id));
    const maybeInvoiceItems = await context.repos.invoiceItem.getItemsByInvoiceId(
      invoiceId
    );

    if (maybeInvoiceItems.isLeft()) {
      throw maybeInvoiceItems.value;
    }

    const [invoiceItem] = maybeInvoiceItems.value;

    context.repos.waiver.addMockWaiverForInvoiceItem(
      waiver.value,
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
  const invoiceId = InvoiceId.create(new UniqueEntityID(id));
  const invoice = await context.repos.invoice.getInvoiceById(invoiceId);

  if (invoice.isLeft()) {
    throw invoice.value;
  }

  const maybeResult = await context.repos.invoice.delete(invoice.value);

  if (maybeResult.isLeft()) {
    throw maybeResult.value;
  }
});

Given(/^Invoice with id "([\w\d-]+)" is accepted$/, async (id: string) => {
  const invoiceId = InvoiceId.create(new UniqueEntityID(id));
  const maybeInvoice = await context.repos.invoice.getInvoiceById(invoiceId);

  if (maybeInvoice.isLeft()) {
    throw maybeInvoice.value;
  }

  const invoice = maybeInvoice.value;

  invoice.props.dateAccepted = new Date(invoiceAcceptanceDate);
  await context.repos.invoice.update(invoice);
});
