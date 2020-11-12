import { expect } from 'chai';
import { Before, Given, Then, When } from 'cucumber';

import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';
import { MockErpService } from '../../../../../../src/lib/domain/services/mocks/MockErpService';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { PublishRevenueRecognitionReversalUsecase } from '../../../../../../src/lib/modules/invoices/usecases/ERP/publishRevenueRecognitionReversal/publishRevenueRecognitionReversal';
import { PublishRevenueRecognitionReversalResponse } from '../../../../../../src/lib/modules/invoices/usecases/ERP/publishRevenueRecognitionReversal/publishRevenueRecognitionReversal.response';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';
import { MockPublisherRepo } from '../../../../../../src/lib/modules/publishers/repos/mocks/mockPublisherRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
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

let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockAddressRepo: MockAddressRepo;
let mockPayerRepo: MockPayerRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockManuscriptRepo: MockArticleRepo;
let mockCatalogRepo: MockCatalogRepo;
let mockNetsuiteService: MockErpService;
let mockPublisherRepo: MockPublisherRepo;
let mockLogger: MockLogger;

let useCase: PublishRevenueRecognitionReversalUsecase;
let response: PublishRevenueRecognitionReversalResponse;
let invoice: Invoice;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before(function () {
  invoice = null;

  mockInvoiceRepo = new MockInvoiceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockPayerRepo = new MockPayerRepo();
  mockAddressRepo = new MockAddressRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockCatalogRepo = new MockCatalogRepo();
  mockPublisherRepo = new MockPublisherRepo();
  mockNetsuiteService = new MockErpService();
  mockLogger = new MockLogger();

  setupVatService();

  useCase = new PublishRevenueRecognitionReversalUsecase(
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPayerRepo,
    mockAddressRepo,
    mockManuscriptRepo,
    mockCatalogRepo,
    mockPublisherRepo,
    mockNetsuiteService,
    mockLogger
  );
});

Given(/An Invoice with the ID "([\w-]+)"/, async function (invoiceId: string) {
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
    id: 'testingPublisher',
    customValues: {},
  } as any);

  const catalog = CatalogMap.toDomain({
    publisherId: publisher.publisherId.id.toString(),
    isActive: true,
    journalId: 'testingJournal',
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
  transaction.addInvoice(invoice);

  mockManuscriptRepo.addMockItem(manuscript);
  mockInvoiceRepo.addMockItem(invoice);
  mockInvoiceItemRepo.addMockItem(invoiceItem);
  mockPublisherRepo.addMockItem(publisher);
  mockCatalogRepo.addMockItem(catalog);
});

Given(
  /The payer country is "([\w-]+)" and the type is "([\w-]+)"/,
  async function (country: string, payerType: string) {
    const address = AddressMap.toDomain({
      country,
    });
    const payer = PayerMap.toDomain({
      name: 'Silvestru',
      addressId: address.id.toValue(),
      invoiceId: invoice.invoiceId.id.toValue(),
      type: payerType,
    });
    mockPayerRepo.addMockItem(payer);
    mockAddressRepo.addMockItem(address);
  }
);

Given(/There is a discounted Invoice with the ID "([\w-]+)"/, async function (
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
    id: 'testingPublisher',
    customValues: {},
  } as any);

  const catalog = CatalogMap.toDomain({
    publisherId: publisher.publisherId.id.toString(),
    isActive: true,
    journalId: 'testingJournal',
  });

  const manuscript = ArticleMap.toDomain({
    customId: '8888',
    journalId: catalog.journalId.id.toValue(),
    datePublished: new Date(),
  });

  const invoiceItem = InvoiceItemMap.toDomain({
    invoiceId: invoiceId,
    id: 'invoice-item',
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

  mockInvoiceRepo.addMockItem(invoice);
  mockInvoiceItemRepo.addMockItem(invoiceItem);
  mockManuscriptRepo.addMockItem(manuscript);
  mockPublisherRepo.addMockItem(publisher);
  mockCatalogRepo.addMockItem(catalog);

  transaction.addInvoice(invoice);
});

When(
  /Revenue recognition reversal usecase executes for the invoice with the ID "([\w-]+)"/,
  async function (invoiceId: string) {
    response = await useCase.execute({ invoiceId }, context);
  }
);

Then(
  /Revenue recognition reversal is registered to Netsuite for Invoice with ID "([\w-]+)"/,
  async function (invoiceId: string) {
    expect(response.isRight()).to.be.true;
    const revenueData = mockNetsuiteService.getRevenue(invoiceId);
    expect(!!revenueData).to.be.true;

    const invoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    expect(invoice.revenueRecognitionReference).to.equal(
      mockNetsuiteService.revenueRef
    );
  }
);
