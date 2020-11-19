// tslint:disable: no-unused-expression

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
import { MockLogger } from './../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';
import { MockPublisherRepo } from '../../../../../../src/lib/modules/publishers/repos/mocks/mockPublisherRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { setupVatService } from '../../../../../../src/lib/domain/services/mocks/VatSoapClient';
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

let useCase: PublishInvoiceToErpUsecase;
let response: PublishInvoiceToErpResponse;
let invoice: Invoice;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before(function () {
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
  mockLogger = new MockLogger();
  mockPublisherRepo = new MockPublisherRepo();
  vatService = new VATService();

  mockInvoiceRepo = new MockInvoiceRepo(null, null, mockErpReferenceRepo);

  setupVatService();

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
    vatService
  );
});

Given(/There is an existing Invoice with the ID "([\w-]+)"/, async function (
  invoiceId: string
) {
  const transaction = TransactionMap.toDomain({
    status: TransactionStatus.ACTIVE,
    deleted: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  });
  invoice = InvoiceMap.toDomain({
    transactionId: transaction.id.toValue(),
    dateCreated: new Date(),
    id: invoiceId,
  });

  const publisher = PublisherMap.toDomain({
    id: 'publisher1',
    customValues: {},
  } as any);

  const catalog = CatalogMap.toDomain({
    publisherId: publisher.publisherId.id.toString(),
    isActive: true,
    journalId: 'journal1',
  });

  const manuscript = ArticleMap.toDomain({
    customId: '8888',
    journalId: catalog.journalId.id.toValue(),
  });

  const invoiceItem = InvoiceItemMap.toDomain({
    invoiceId: invoiceId,
    manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
    price: 100,
    vat: 0,
  });

  const erpReference = ErpReferenceMap.toDomain({
    entity_id: invoiceId,
    entity_type: 'invoice',
    vendor: 'testVendor',
    attribute: 'erp',
    value: 'FOO',
  });

  invoice.addItems([invoiceItem]);

  await mockInvoiceRepo.save(invoice);
  await mockInvoiceItemRepo.save(invoiceItem);
  await mockManuscriptRepo.save(manuscript);
  mockPublisherRepo.addMockItem(publisher);
  mockCatalogRepo.addMockItem(catalog);
  mockErpReferenceRepo.addMockItem(erpReference);

  transaction.addInvoice(invoice);
});

Given(
  /There is an fully discounted Invoice with an existing ID "([\w-]+)"/,
  async function (invoiceId: string) {
    const transaction = TransactionMap.toDomain({
      status: TransactionStatus.ACTIVE,
      deleted: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
    invoice = InvoiceMap.toDomain({
      transactionId: transaction.id.toValue(),
      dateCreated: new Date(),
      id: invoiceId,
    });

    const publisher = PublisherMap.toDomain({
      id: 'publisher1',
      customValues: {},
    } as any);

    const catalog = CatalogMap.toDomain({
      publisherId: publisher.publisherId.id.toString(),
      isActive: true,
      journalId: 'journal1',
    });

    const manuscript = ArticleMap.toDomain({
      customId: '8888',
      journalId: catalog.journalId.id.toValue(),
    });

    const invoiceItem = InvoiceItemMap.toDomain({
      invoiceId: invoiceId,
      id: 'inv-item',
      manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
      price: 100,
      vat: 0,
    });

    mockCouponRepo.addMockCouponToInvoiceItem(
      CouponMap.toDomain({
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
      }),
      invoiceItem.invoiceItemId
    );

    mockWaiverRepo.addMockWaiverForInvoiceItem(
      WaiverMap.toDomain({
        waiverType: 'EDITOR_DISCOUNT',
        reduction: 50,
        isActive: true,
      }),
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
    const address = AddressMap.toDomain({
      country,
    });
    const payer = PayerMap.toDomain({
      name: 'John',
      addressId: address.id.toValue(),
      invoiceId: invoice.invoiceId.id.toValue(),
      type: payerType,
    });
    mockPayerRepo.addMockItem(payer);
    mockAddressRepo.addMockItem(address);
  }
);

When(/The Invoice with the ID "([\w-]+)" is published/, async function (
  invoiceId: string
) {
  response = await useCase.execute({ invoiceId }, context);
});

Then(/The Invoice with the ID "([\w-]+)" is registered to erp/, async function (
  invoiceId: string
) {
  expect(response.isRight()).to.be.true;

  const erpData = mockErpService.getInvoice(invoiceId);
  expect(!!erpData).to.be.true;

  const testInvoice = await mockInvoiceRepo.getInvoiceById(
    InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
  );

  expect(
    testInvoice
      .getErpReferences()
      .getItems()
      .find((ef) => ef.attribute === 'erp').value
  ).to.equal('FOO');
});

Then(
  /The Invoice with the ID "([\w-]+)" is not registered to erp/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;

    const erpData = mockErpService.getInvoice(invoiceId);
    expect(!!erpData).to.be.false;
  }
);

Then(
  /The tax code selected for the Invoice with the ID "([\w-]+)" is ([\d]+)/,
  function (invoiceId: string, taxRate: string) {
    expect(response.isRight()).to.be.true;
    const netsuiteData = mockErpService.getInvoice(invoiceId);
    expect(netsuiteData.taxRateId).to.equal(taxRate);
  }
);
