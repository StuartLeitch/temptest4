import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { EmailService } from '../../../../../../src/lib/infrastructure/communication-channels/index';

import { ApplyCouponToInvoiceUsecase } from '../../../../../../src/lib/modules/coupons/usecases/applyCouponToInvoice/applyCouponToInvoice';
import { ApplyCouponToInvoiceResponse } from '../../../../../../src/lib/modules/coupons/usecases/applyCouponToInvoice/applyCouponToInvoiceResponse';

import { Coupon } from '../../../../../../src/lib/modules/coupons/domain/Coupon';

import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';

import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockPublisherRepo } from '../../../../../../src/lib/modules/publishers/repos/mocks/mockPublisherRepo';

import {
  ArticleMap,
  CatalogMap,
  CouponMap,
  Invoice,
  InvoiceMap,
  InvoiceItemMap,
  Roles,
  TransactionMap,
  TransactionStatus,
  UsecaseAuthorizationContext,
  InvoiceId,
  UniqueEntityID,
  VATService,
  MockLoggerBuilder,
  WaiverMap,
} from '../../../../../../src/lib/shared';
import { WaiverType } from '../../../../../../src/lib/modules/waivers/domain/Waiver';

function makeCouponData(id: string, code: string, overwrites?: any): Coupon {
  const maybeCoupon = CouponMap.toDomain({
    id,
    code,
    status: 'ACTIVE',
    redeemCount: 1,
    dateCreated: new Date(),
    invoiceItemType: 'APC',
    name: 'test-coupon',
    ...overwrites,
  });

  if (maybeCoupon.isLeft()) {
    throw maybeCoupon.value;
  }

  return maybeCoupon.value;
}
function makeInactiveCouponData(code: string, overwrites?: any): Coupon {
  const maybeCoupon = CouponMap.toDomain({
    id: 'inactivecoupon',
    code,
    status: 'INACTIVE',
    redeemCount: 1,
    dateCreated: new Date(),
    invoiceItemType: 'APC',
    name: 'test-coupon',
    ...overwrites,
  });

  if (maybeCoupon.isLeft()) {
    throw maybeCoupon.value;
  }

  return maybeCoupon.value;
}

let mockInvoiceRepo: MockInvoiceRepo = null;
let mockInvoiceItemRepo: MockInvoiceItemRepo = null;
let mockCouponRepo: MockCouponRepo = null;
let mockTransactionRepo: MockTransactionRepo = null;
let mockManuscriptRepo: MockArticleRepo = null;
let mockAddressRepo: MockAddressRepo = null;
let mockPayerRepo: MockPayerRepo = null;
let mockCatalogRepo: MockCatalogRepo = null;
let mockWaiverRepo: MockWaiverRepo = null;
let mockPublisherRepo: MockPublisherRepo = null;
let emailService: EmailService = null;
let mockLogger: MockLogger = null;
let mockVatService: any = null;
const mailingDisabled: boolean = null;
const fePath: string = null;
const tenantName: string = null;

let usecase: ApplyCouponToInvoiceUsecase = null;
let response: ApplyCouponToInvoiceResponse = null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

let invoice: Invoice = null;
let coupon: Coupon = null;

Before({ tags: '@ValidateApplyCoupon' }, () => {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockCouponRepo = new MockCouponRepo();
  mockTransactionRepo = new MockTransactionRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockAddressRepo = new MockAddressRepo();
  mockPayerRepo = new MockPayerRepo();
  mockCatalogRepo = new MockCatalogRepo();
  mockPublisherRepo = new MockPublisherRepo();
  mockWaiverRepo = new MockWaiverRepo();
  emailService = new EmailService(mailingDisabled, fePath, tenantName, '', '');
  mockLogger = new MockLoggerBuilder().getLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo
  );

  mockVatService = new VATService();

  usecase = new ApplyCouponToInvoiceUsecase(
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockCouponRepo,
    mockTransactionRepo,
    mockManuscriptRepo,
    mockAddressRepo,
    mockPayerRepo,
    mockWaiverRepo,
    emailService,
    mockVatService,
    mockLogger,
    { log: () => void 0 }
  );
});

After({ tags: '@ValidateApplyCoupon' }, () => {
  mockInvoiceItemRepo = null;
  mockCouponRepo = null;
  mockTransactionRepo = null;
  mockManuscriptRepo = null;
  mockAddressRepo = null;
  mockPayerRepo = null;
  mockCatalogRepo = null;
  mockPublisherRepo = null;
  mockWaiverRepo = null;
  emailService = null;
  mockLogger = null;
  mockInvoiceRepo = null;
  mockVatService = null;
  usecase = null;
});

Given(
  /^we have an Invoice with id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    const maybeTransaction = TransactionMap.toDomain({
      status: TransactionStatus.ACTIVE,
      deleted: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    if (maybeTransaction.isLeft()) {
      throw maybeTransaction.value;
    }

    const transaction = maybeTransaction.value;

    const maybeInvoice = InvoiceMap.toDomain({
      transactionId: transaction.id.toValue(),
      status: 'DRAFT',
      dateCreated: new Date(),
      id: testInvoiceId,
    });

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    invoice = maybeInvoice.value;

    const maybePublisher = PublisherMap.toDomain({
      id: 'publisher1',
      customValues: {},
    } as any);

    if (maybePublisher.isLeft()) {
      throw maybePublisher.value;
    }

    const publisher = maybePublisher.value;

    const maybeCatalog = CatalogMap.toDomain({
      publisherId: publisher.publisherId.id.toString(),
      journalId: 'journal1',
    });

    if (maybeCatalog.isLeft()) {
      throw maybeCatalog.value;
    }

    const catalog = maybeCatalog.value;

    const datePublished = new Date();

    const maybeManuscript = ArticleMap.toDomain({
      customId: '8888',
      journalId: catalog.journalId.id.toValue(),
      datePublished: datePublished.setDate(datePublished.getDate() - 1),
    });

    if (maybeManuscript.isLeft()) {
      throw maybeManuscript.value;
    }

    const manuscript = maybeManuscript.value;

    const maybeInvoiceItem = InvoiceItemMap.toDomain({
      invoiceId: testInvoiceId,
      manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
      price: 100,
      vat: 0,
    });

    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }

    const invoiceItem = maybeInvoiceItem.value;

    mockPublisherRepo.addMockItem(publisher);
    mockCatalogRepo.addMockItem(catalog);
    mockManuscriptRepo.addMockItem(manuscript);
    mockInvoiceItemRepo.addMockItem(invoiceItem);

    mockTransactionRepo.addMockItem(transaction);
    mockInvoiceRepo.addMockItem(invoice);
  }
);

Given(
  /^a coupon with id "([\w-]+)" with code "([\w-]+)" and reduction "([\d]+)"/,
  async (testCouponId: string, testCode: string, reduction: string) => {
    coupon = makeCouponData(testCouponId, testCode, {
      reduction: Number.parseInt(reduction),
    });
    const maybeCoupon = await mockCouponRepo.save(coupon);

    if (maybeCoupon.isLeft()) {
      throw maybeCoupon.value;
    }

    coupon = maybeCoupon.value;
  }
);

When(
  /^I apply coupon for invoice "([\w-]+)" with code "([\w-]+)"/,
  async (testInvoiceId: string, testCode: string) => {
    response = await usecase.execute(
      {
        invoiceId: testInvoiceId,
        couponCode: testCode,
      },
      context
    );
  }
);

Then(
  /^coupon should be applied for invoice "([\w-]+)"/,
  (testInvoiceId: string) => {
    expect(response.isRight()).to.be.true;
  }
);

When(
  /^I apply inactive coupon for invoice "([\w-]+)" with code "([\w-]+)"/,
  async (testInvoiceId: string, testCode: string) => {
    let inactiveCoupon = makeInactiveCouponData(testCode);
    const maybeInactiveCoupon = await mockCouponRepo.save(inactiveCoupon);

    if (maybeInactiveCoupon.isLeft()) {
      throw maybeInactiveCoupon.value;
    }

    inactiveCoupon = maybeInactiveCoupon.value;

    response = await usecase.execute(
      {
        invoiceId: testInvoiceId,
        couponCode: testCode,
      },
      context
    );
  }
);

Then(/^I receive an error that coupon is inactive/, () => {
  expect(response.isLeft()).to.be.true;
});

Then(
  /^The invoice with id "([\w-]+)" is auto-confirmed$/,
  async (invoiceId: string) => {
    const maybePayer = await mockPayerRepo.getPayerByInvoiceId(
      InvoiceId.create(new UniqueEntityID(invoiceId))
    );

    expect(response.isRight()).to.be.true;

    expect(maybePayer.isRight()).to.be.true;
    if (maybePayer.isRight()) {
      expect(maybePayer.value).to.exist;
    }
  }
);

Given(
  /^A waiver of "([\d]+)" is applied to invoice "([\w-]+)"$/,
  async (reduction: string, invoiceId: string) => {
    const maybeWaiver = WaiverMap.toDomain({
      waiverType: WaiverType.EDITOR_DISCOUNT,
      reduction: Number.parseInt(reduction),
      isActive: true,
    });

    if (maybeWaiver.isLeft()) {
      throw maybeWaiver.value;
    }

    const waiver = maybeWaiver.value;

    const maybeInvoiceItems = await mockInvoiceItemRepo.getItemsByInvoiceId(
      InvoiceId.create(new UniqueEntityID(invoiceId))
    );

    if (maybeInvoiceItems.isLeft()) {
      throw maybeInvoiceItems.value;
    }

    const invoiceItems = maybeInvoiceItems.value;

    mockWaiverRepo.addMockWaiverForInvoiceItem(waiver, invoiceItems[0]);
  }
);

Then(
  /^I receive an error that coupon with code "([\w-]+)" is already applied$/,
  (couponCode: string) => {
    expect(response.isLeft()).to.be.true;
    if (response.isLeft()) {
      expect(response.value.message).to.equal(
        `Coupon ${couponCode} has already been used for this invoice.`
      );
    }
  }
);
