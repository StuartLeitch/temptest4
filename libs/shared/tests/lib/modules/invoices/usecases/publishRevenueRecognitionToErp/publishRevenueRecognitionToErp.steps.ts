// tslint:disable: no-unused-expression

import { expect } from 'chai';
import { Before, Given, Then, When } from 'cucumber';

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
import { MockLogger } from './../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
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
// let mockNetsuiteService: MockErpService;
let mockPublisherRepo: MockPublisherRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let mockLogger: MockLogger;

let useCase: PublishRevenueRecognitionToErpUsecase;
let response: PublishRevenueRecognitionToErpResponse;
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
  mockSalesforceService = new MockErpService();
  // mockNetsuiteService = new MockErpService();
  mockPublisherRepo = new MockPublisherRepo();
  mockLogger = new MockLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );

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
    mockSalesforceService,
    mockLogger
  );
});

Given(/There is an Invoice with the ID "([\w-]+)" created/, async function (
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

  const datePublished = new Date();
  const manuscript = ArticleMap.toDomain({
    customId: '8888',
    journalId: catalog.journalId.id.toValue(),
    datePublished: datePublished.setDate(datePublished.getDate() - 1),
  });

  const invoiceItem = InvoiceItemMap.toDomain({
    invoiceId: invoiceId,
    manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
    price: 100,
    vat: 0,
  });

  invoice.addItems([invoiceItem]);

  const erpReference = ErpReferenceMap.toDomain({
    entity_id: invoiceId,
    entity_type: 'invoice',
    vendor: 'testVendor',
    attribute: 'erp',
    value: 'FOO',
  });

  await mockInvoiceRepo.save(invoice);
  await mockInvoiceItemRepo.save(invoiceItem);
  await mockManuscriptRepo.save(manuscript);
  mockPublisherRepo.addMockItem(publisher);
  mockCatalogRepo.addMockItem(catalog);
  mockErpReferenceRepo.addMockItem(erpReference);

  transaction.addInvoice(invoice);
});

Given(
  /The payer country is "([\w-]+)" and their type is "([\w-]+)"/,
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

Given(
  /There is a fully discounted Invoice with the ID "([\w-]+)" created/,
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
      datePublished: new Date(),
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
        waiverType: 'EDITOR_DISCOUT',
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

    const testInvoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    const erpReferences = testInvoice.getErpReferences().getItems();

    expect(erpReferences.find((ef) => ef.attribute === 'erp').value).to.equal(
      'FOO'
    );
  }
);

Then(
  /Revenue recognition for the Invoice with the ID "([\w-]+)" is not registered/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;
    const revenueData = mockSalesforceService.getRevenue(invoiceId);
    expect(!!revenueData).to.be.false;

    const testInvoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    const erpReferences = testInvoice.getErpReferences().getItems();

    expect(erpReferences.length).to.equal(1);

    const [nonInvoiceable] = erpReferences;
    expect(nonInvoiceable.value).to.equal('NON_INVOICEABLE');
  }
);
