import { expect } from 'chai';
import { Before, Given, Then, When } from '@cucumber/cucumber';

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
  Invoice,
  InvoiceItemMap,
  PayerMap,
  PayerType,
  Roles,
  TransactionMap,
  TransactionStatus,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { MockErpReferenceRepo } from '../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';
import { ErpReferenceMap } from './../../../../../../src/lib/modules/vendors/mapper/ErpReference';

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
let mockErpReferenceRepo: MockErpReferenceRepo;
let mockLogger: MockLogger;

let useCase: PublishRevenueRecognitionReversalUsecase;
let response: PublishRevenueRecognitionReversalResponse;
let invoice: Invoice;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

const testInvoiceId = 'testing-invoice';

Before({ tags: '@ValidatePublishRevRecReversalToErp' }, function () {
  invoice = null;

  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockPayerRepo = new MockPayerRepo();
  mockAddressRepo = new MockAddressRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockCatalogRepo = new MockCatalogRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockPublisherRepo = new MockPublisherRepo();
  mockNetsuiteService = new MockErpService();
  mockLogger = new MockLogger();
  mockInvoiceRepo = new MockInvoiceRepo(null, null, mockErpReferenceRepo);

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
    mockErpReferenceRepo,
    mockNetsuiteService,
    mockLogger
  );
});

Given(/A regular invoice/, async function () {
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
    id: testInvoiceId,
  });

  if (maybeInvoice.isLeft()) {
    throw maybeInvoice.value;
  }

  invoice = maybeInvoice.value;

  const maybePublisher = PublisherMap.toDomain({
    id: 'testingPublisher',
    customValues: {},
  } as any);

  if (maybePublisher.isLeft()) {
    throw maybePublisher.value;
  }

  const publisher = maybePublisher.value;

  const maybeCatalog = CatalogMap.toDomain({
    publisherId: publisher.publisherId.id.toString(),
    isActive: true,
    journalId: 'testingJournal',
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
    invoiceId: testInvoiceId,
    id: 'invoice-item',
    manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
    price: 100,
    vat: 20,
  });

  if (maybeInvoiceItem.isLeft()) {
    throw maybeInvoiceItem.value;
  }

  const invoiceItem = maybeInvoiceItem.value;

  const maybeErpReference = ErpReferenceMap.toDomain({
    entity_id: testInvoiceId,
    entity_type: 'invoice',
    vendor: 'testVendor',
    attribute: 'revenueRecognition',
    value: 'FOO',
  });

  if (maybeErpReference.isLeft()) {
    throw maybeErpReference.value;
  }

  const erpReference = maybeErpReference.value;

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

  invoice.addItems([invoiceItem]);

  mockPublisherRepo.addMockItem(publisher);
  mockCatalogRepo.addMockItem(catalog);
  mockManuscriptRepo.addMockItem(manuscript);
  mockInvoiceItemRepo.addMockItem(invoiceItem);
  mockErpReferenceRepo.addMockItem(erpReference);

  transaction.addInvoice(invoice);
  mockInvoiceRepo.addMockItem(invoice);
});

When(/Reversal usecase executes for Invoice/, async function () {
  const invoiceId = testInvoiceId;
  response = await useCase.execute({ invoiceId }, context);
});

Then(/Reversal created in Netsuite for Invoice/, async function () {
  expect(response.isRight()).to.be.true;

  const revenueData = mockNetsuiteService.getRevenue(testInvoiceId);

  expect(!!revenueData).to.be.true;

  const maybeTestInvoice = await mockInvoiceRepo.getInvoiceById(
    InvoiceId.create(new UniqueEntityID(testInvoiceId))
  );

  if (maybeTestInvoice.isLeft()) {
    throw maybeTestInvoice.value;
  }

  const testInvoice = maybeTestInvoice.value;

  const erpReferences = testInvoice.getErpReferences().getItems();

  expect(
    erpReferences.find((ef) => ef.attribute === 'revenueRecognition').value
  ).to.equal('FOO');
});
