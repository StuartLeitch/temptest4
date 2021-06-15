import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { EmailService } from '../../../../../../src/lib/infrastructure/communication-channels/EmailService';
import { setupVatService } from '../../../../../../src/lib/domain/services/mocks/VatSoapClient';

import { ApplyCouponToInvoiceUsecase } from '../../../../../../src/lib/modules/coupons/usecases/applyCouponToInvoice/applyCouponToInvoice';
import { ApplyCouponToInvoiceResponse } from '../../../../../../src/lib/modules/coupons/usecases/applyCouponToInvoice/applyCouponToInvoiceResponse';

import { Coupon } from '../../../../../../src/lib/modules/coupons/domain/Coupon';
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
import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';

import {
  AddressMap,
  ArticleMap,
  CatalogMap,
  CouponMap,
  Invoice,
  InvoiceMap,
  InvoiceItemMap,
  PayerMap,
  PayerType,
  Roles,
  TransactionMap,
  TransactionStatus,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';

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
let mailingDisabled: boolean = null;
let fePath: string = null;
let tenantName: string = null;

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
  emailService = new EmailService(mailingDisabled, fePath, tenantName);
  mockLogger = new MockLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo
  );

  mockVatService = setupVatService();

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
    mockLogger
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
      isActive: true,
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

    const maybeAddress = AddressMap.toDomain({
      country: 'RO',
    });

    if (maybeAddress.isLeft()) {
      throw maybeAddress.value;
    }

    const address = maybeAddress.value;

    const maybePayer = PayerMap.toDomain({
      name: 'Silvestru',
      addressId: address.id.toValue(),
      invoiceId: invoice.invoiceId.id.toValue(),
      type: PayerType.INDIVIDUAL,
    });

    if (maybePayer.isLeft()) {
      throw maybePayer.value;
    }

    const payer = maybePayer.value;

    mockPayerRepo.addMockItem(payer);
    mockAddressRepo.addMockItem(address);

    mockPublisherRepo.addMockItem(publisher);
    mockCatalogRepo.addMockItem(catalog);
    mockManuscriptRepo.addMockItem(manuscript);
    mockInvoiceItemRepo.addMockItem(invoiceItem);

    mockTransactionRepo.addMockItem(transaction);
    mockInvoiceRepo.addMockItem(invoice);
  }
);

Given(
  /^a coupon with id "([\w-]+)" with code "([\w-]+)"/,
  async (testCouponId: string, testCode: string) => {
    coupon = makeCouponData(testCouponId, testCode);
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
    response = await usecase.execute({
      invoiceId: testInvoiceId,
      couponCode: testCode,
    });
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

    response = await usecase.execute({
      invoiceId: testInvoiceId,
      couponCode: testCode,
    });
  }
);

Then(/^I receive an error that coupon is inactive/, () => {
  expect(response.isLeft()).to.be.true;
});
