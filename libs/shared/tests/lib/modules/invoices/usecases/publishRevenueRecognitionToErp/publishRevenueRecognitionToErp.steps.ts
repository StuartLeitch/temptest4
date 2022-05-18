import { expect } from 'chai';
import { Before, Given, Then, When } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';
import { MockErpService } from '../../../../../../src/lib/domain/services/mocks/MockErpService';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { PublishRevenueRecognitionToErpUsecase } from '../../../../../../src/lib/modules/invoices/usecases/ERP/publishRevenueRecognitionToErp/publishRevenueRecognitionToErp';
import { PublishRevenueRecognitionToErpResponse } from '../../../../../../src/lib/modules/invoices/usecases/ERP/publishRevenueRecognitionToErp/publishRevenueRecognitionToErpResponse';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';
import { MockPublisherRepo } from '../../../../../../src/lib/modules/publishers/repos/mocks/mockPublisherRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockErpReferenceRepo } from '../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';
import {
  MockLogger,
  MockLoggerBuilder,
} from './../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { setupVatService } from '../../../../../../src/lib/domain/services/mocks/VatSoapClient';
import {
  AddressMap,
  ArticleMap,
  CatalogMap,
  CouponMap,
  Invoice,
  InvoiceItemMap,
  MockCreditNoteRepo,
  PayerMap,
  Roles,
  TransactionMap,
  TransactionStatus,
  UsecaseAuthorizationContext,
  WaiverMap,
} from '../../../../../../src/lib/shared';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { ErpReferenceMap } from './../../../../../../src/lib/modules/vendors/mapper/ErpReference';

let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockAddressRepo: MockAddressRepo;
let mockPayerRepo: MockPayerRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockManuscriptRepo: MockArticleRepo;
let mockCatalogRepo: MockCatalogRepo;
let mockSalesforceService: MockErpService;
let mockPublisherRepo: MockPublisherRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let mockLogger: MockLogger;
let mockCreditNoteRepo: MockCreditNoteRepo;

let useCase: PublishRevenueRecognitionToErpUsecase;
let response: PublishRevenueRecognitionToErpResponse;
let invoice: Invoice;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.CHRON_JOB],
};

Before({ tags: '@ValidatePublishRevRecToErp' }, function () {
  invoice = null;
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockAddressRepo = new MockAddressRepo();
  mockPayerRepo = new MockPayerRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockCatalogRepo = new MockCatalogRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockSalesforceService = new MockErpService();
  mockPublisherRepo = new MockPublisherRepo();
  mockLogger = new MockLoggerBuilder().getLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
  mockCreditNoteRepo = new MockCreditNoteRepo();

  setupVatService();

  useCase = new PublishRevenueRecognitionToErpUsecase(
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPayerRepo,
    mockAddressRepo,
    mockManuscriptRepo,
    mockCatalogRepo,
    mockPublisherRepo,
    mockErpReferenceRepo,
    mockCreditNoteRepo,
    mockSalesforceService,
    mockLogger
  );
});

Given(
  /There is an Invoice with the ID "([\w-]+)" created/,
  async function (invoiceId: string) {
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
      dateCreated: new Date(),
      id: invoiceId,
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
      invoiceId: invoiceId,
      manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
      price: 100,
      vat: 0,
    });

    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }

    const invoiceItem = maybeInvoiceItem.value;

    invoice.addItems([invoiceItem]);

    const maybeErpReference = ErpReferenceMap.toDomain({
      entity_id: invoiceId,
      entity_type: 'invoice',
      vendor: 'testVendor',
      attribute: 'confirmation',
      value: 'FOO',
    });

    if (maybeErpReference.isLeft()) {
      throw maybeErpReference.value;
    }

    const erpReference = maybeErpReference.value;

    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);
    await mockManuscriptRepo.save(manuscript);
    mockPublisherRepo.addMockItem(publisher);
    mockCatalogRepo.addMockItem(catalog);
    mockErpReferenceRepo.addMockItem(erpReference);

    transaction.addInvoice(invoice);
  }
);

Given(
  /The payer country is "([\w-]+)" and their type is "([\w-]+)"/,
  async function (country: string, payerType: string) {
    const maybeAddress = AddressMap.toDomain({
      country,
    });

    if (maybeAddress.isLeft()) {
      throw maybeAddress.value;
    }

    const address = maybeAddress.value;

    const maybePayer = PayerMap.toDomain({
      name: 'John',
      addressId: address.id.toValue(),
      invoiceId: invoice.invoiceId.id.toValue(),
      type: payerType,
    });

    if (maybePayer.isLeft()) {
      throw maybePayer.value;
    }

    const payer = maybePayer.value;

    mockPayerRepo.addMockItem(payer);
    mockAddressRepo.addMockItem(address);
  }
);

Given(
  /There is a fully discounted Invoice with the ID "([\w-]+)" created/,
  async function (invoiceId: string) {
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
      dateCreated: new Date(),
      id: invoiceId,
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

    const maybeManuscript = ArticleMap.toDomain({
      customId: '8888',
      journalId: catalog.journalId.id.toValue(),
      datePublished: new Date(),
    });

    if (maybeManuscript.isLeft()) {
      throw maybeManuscript.value;
    }

    const manuscript = maybeManuscript.value;

    const maybeInvoiceItem = InvoiceItemMap.toDomain({
      invoiceId: invoiceId,
      id: 'inv-item',
      manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
      price: 100,
      vat: 0,
    });

    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }

    const invoiceItem = maybeInvoiceItem.value;

    const maybeCoupon = CouponMap.toDomain({
      code: 'ASD1123',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      id: 'coup1',
      invoiceItemType: 'APC',
      name: 'coup',
      redeemCount: 1,
      reduction: 50,
      status: 'active',
      type: 'SINGLE_USE',
    });

    if (maybeCoupon.isLeft()) {
      throw maybeCoupon.value;
    }

    const coupon = maybeCoupon.value;

    mockCouponRepo.addMockCouponToInvoiceItem(
      coupon,
      invoiceItem.invoiceItemId
    );

    const maybeWaiver = WaiverMap.toDomain({
      waiverType: 'EDITOR_DISCOUT',
      reduction: 50,
      isActive: true,
    });

    if (maybeWaiver.isLeft()) {
      throw maybeWaiver.value;
    }

    const waiver = maybeWaiver.value;

    mockWaiverRepo.addMockWaiverForInvoiceItem(
      waiver,
      invoiceItem.invoiceItemId
    );

    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);
    await mockManuscriptRepo.save(manuscript);

    mockPublisherRepo.addMockItem(publisher);
    mockCatalogRepo.addMockItem(catalog);

    transaction.addInvoice(invoice);
  }
);

When(
  /Revenue recognition usecase is execute for the invoice with the ID "([\w-]+)"/,
  async function (invoiceId: string) {
    response = await useCase.execute({ invoiceId }, context);
  }
);

Then(
  /Revenue recognition for the Invoice with the ID "([\w-]+)" is registered to salesforce/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;
    const revenueData = mockSalesforceService.getRevenue(invoiceId);
    expect(!!revenueData).to.be.true;

    const maybeTestInvoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId))
    );

    if (maybeTestInvoice.isLeft()) {
      throw maybeTestInvoice.value;
    }

    const testInvoice = maybeTestInvoice.value;

    const erpReferences = testInvoice.getErpReferences().getItems();

    expect(
      erpReferences.find((ef) => ef.attribute === 'confirmation').value
    ).to.equal('FOO');
  }
);

Then(
  /Revenue recognition for the Invoice with the ID "([\w-]+)" is not registered/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;
    const revenueData = mockSalesforceService.getRevenue(invoiceId);
    expect(!!revenueData).to.be.false;

    const maybeTestInvoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId))
    );

    if (maybeTestInvoice.isLeft()) {
      throw maybeTestInvoice.value;
    }

    const testInvoice = maybeTestInvoice.value;

    const erpReferences = testInvoice.getErpReferences().getItems();

    expect(erpReferences.length).to.equal(1);

    const [nonInvoiceable] = erpReferences;

    expect(nonInvoiceable.value).to.equal('NON_INVOICEABLE');
  }
);
