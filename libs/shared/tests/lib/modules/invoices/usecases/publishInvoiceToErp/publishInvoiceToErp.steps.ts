import { expect } from 'chai';
import { Before, Given, Then, When } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';
import { MockErpService } from '../../../../../../src/lib/domain/services/mocks/MockErpService';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { PublishInvoiceToErpUsecase } from '../../../../../../src/lib/modules/invoices/usecases/ERP/publishInvoiceToErp/publishInvoiceToErp';
import { PublishInvoiceToErpResponse } from '../../../../../../src/lib/modules/invoices/usecases/ERP/publishInvoiceToErp/publishInvoiceToErpResponse';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockErpReferenceRepo } from '../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';
import {
  MockLogger,
  MockLoggerBuilder,
} from './../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';
import { MockPublisherRepo } from '../../../../../../src/lib/modules/publishers/repos/mocks/mockPublisherRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockExchangeRateService } from '../../../../../../src/lib/modules/exchange-rate/services/mocks';
import { ExchangeRateServiceContract } from '../../../../../../src/lib/modules/exchange-rate/services/';
import {
  AddressMap,
  ArticleMap,
  CatalogMap,
  CouponMap,
  Invoice,
  InvoiceItemMap,
  PayerMap,
  Roles,
  TransactionMap,
  TransactionStatus,
  UsecaseAuthorizationContext,
  WaiverMap,
  VATService,
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
let mockErpService: MockErpService;
let mockPublisherRepo: MockPublisherRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let mockLogger: MockLogger;
let vatService: VATService;
let exchangeRateService: ExchangeRateServiceContract;

let useCase: PublishInvoiceToErpUsecase;
let response: PublishInvoiceToErpResponse;
let invoice: Invoice | null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.CHRON_JOB],
};

Before({ tags: '@ValidatePublishInvoiceToErp' }, function () {
  invoice = null;

  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockAddressRepo = new MockAddressRepo();
  mockPayerRepo = new MockPayerRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockCatalogRepo = new MockCatalogRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockErpService = new MockErpService();
  mockLogger = new MockLoggerBuilder().getLogger();
  mockPublisherRepo = new MockPublisherRepo();
  vatService = new VATService();
  exchangeRateService = new MockExchangeRateService();

  mockInvoiceRepo = new MockInvoiceRepo(undefined, undefined, mockErpReferenceRepo);

  useCase = new PublishInvoiceToErpUsecase(
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPayerRepo,
    mockAddressRepo,
    mockManuscriptRepo,
    mockCatalogRepo,
    mockErpReferenceRepo,
    mockErpService,
    mockPublisherRepo,
    mockLogger,
    vatService,
    exchangeRateService
  );
});

Given(
  /There is an existing Invoice with the ID "([\w-]+)"/,
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

    invoice.addItems([invoiceItem]);

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
  /There is an fully discounted Invoice with an existing ID "([\w-]+)"/,
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

    mockCouponRepo.addMockCouponToInvoiceItem(
      maybeCoupon.value,
      invoiceItem.invoiceItemId
    );

    const maybeWaiver = WaiverMap.toDomain({
      waiverType: 'EDITOR_DISCOUNT',
      reduction: 50,
      isActive: true,
    });

    if (maybeWaiver.isLeft()) {
      throw maybeWaiver.value;
    }

    mockWaiverRepo.addMockWaiverForInvoiceItem(
      maybeWaiver.value,
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

Given(
  /The payer is from "([\w-]+)" and their type is "([\w-]+)"/,
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
      invoiceId: invoice?.invoiceId.id.toValue(),
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

When(
  /The Invoice with the ID "([\w-]+)" is published/,
  async function (invoiceId: string) {
    response = await useCase.execute({ invoiceId }, context);
  }
);

Then(
  /The Invoice with the ID "([\w-]+)" is registered to erp/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;

    const erpData = mockErpService.getInvoice(invoiceId);
    expect(!!erpData).to.be.true;

    const maybeTestInvoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId))
    );

    if (maybeTestInvoice.isLeft()) {
      throw maybeTestInvoice.value;
    }

    const testInvoice = maybeTestInvoice.value;

    expect(
      testInvoice
        .getErpReferences()
        .getItems()
        .find((ef) => ef.attribute === 'confirmation')?.value
    ).to.equal('FOO');
  }
);

Then(
  /The Invoice with the ID "([\w-]+)" is not registered to erp/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;

    const erpData = mockErpService.getInvoice(invoiceId);
    expect(!!erpData).to.be.false;
  }
);

Then(
  /The tax code selected for the Invoice with the ID "([\w-]+)" is ([\d\w_-]+)/,
  function (invoiceId: string, taxCode: string) {
    expect(response.isRight()).to.be.true;
    const netsuiteData = mockErpService.getInvoice(invoiceId);
    expect(netsuiteData.taxDetails.taxCode).to.equal(taxCode);
  }
);
