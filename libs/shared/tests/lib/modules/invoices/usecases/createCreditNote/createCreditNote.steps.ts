import { expect } from 'chai';
import { Given, When, Then, BeforeAll, AfterAll } from 'cucumber';

import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockCouponRepo } from './../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from './../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockEditorRepo } from './../../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

import { InvoiceCollection } from './../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

import { CreateCreditNoteUsecase } from './../../../../../../src/lib/modules/invoices/usecases/createCreditNote/createCreditNote';
import { UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';
import { WaiverService } from './../../../../../../src/lib/domain/services/WaiverService';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';

import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockPausedReminderRepo: MockPausedReminderRepo;
let mockEditorRepo: MockEditorRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;

let mockWaiverService: WaiverService;

let useCase: CreateCreditNoteUsecase;

let invoiceCollection: InvoiceCollection;
let transaction;
let invoice;

BeforeAll(function () {
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockTransactionRepo = new MockTransactionRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockEditorRepo = new MockEditorRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    null,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
  mockWaiverService = new WaiverService(
    mockInvoiceItemRepo,
    mockEditorRepo,
    mockWaiverRepo
  );

  useCase = new CreateCreditNoteUsecase(
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockTransactionRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPausedReminderRepo,
    mockWaiverService
  );
});

AfterAll(function () {
  mockTransactionRepo.clear();
  mockInvoiceRepo.clear();
});

Given(
  /^There is an ACTIVE Invoice with an existing id "([\w-]+)"$/,
  async function (invoiceId: string) {
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.ACTIVE,
      deleted: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    invoice = InvoiceMap.toDomain({
      id: invoiceId,
      status: InvoiceStatus.ACTIVE,
      transactionId: transaction.transactionId.id.toString(),
    });

    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);

    transaction.addInvoice(invoice);
  }
);

When(
  /^I try to create a Credit Note for the invoice with id "([\w-]+)"$/,
  async function (invoiceId: string) {
    await useCase.execute({ invoiceId }, defaultContext);
  }
);

Then('The original Invoice is marked as final', async function () {
  invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();

  expect(invoiceCollection[0].invoiceId.id.toString()).to.equal(
    invoice.id.value
  );
  expect(invoiceCollection[0].status).to.equal(InvoiceStatus.FINAL);
});

Then(
  /^A new Invoice is generated with a reference to the original Invoice ID "([\w-]+)"$/,
  async function (invoiceId: string) {
    expect(invoiceCollection.length).to.equal(2);
    expect(invoiceCollection[1].cancelledInvoiceReference).to.equal(invoiceId);
  }
);

Then('The new Invoice is marked as final', async function () {
  expect(invoiceCollection[1].status).to.equal(InvoiceStatus.FINAL);
});
