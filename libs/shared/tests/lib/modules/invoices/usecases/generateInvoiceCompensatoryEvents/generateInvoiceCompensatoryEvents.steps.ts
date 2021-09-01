import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';
import {
  LoggerContract,
  MockLogger,
} from '../../../../../../src/lib/infrastructure/logging';
import { MockSqsPublishService } from '../../../../../../src/lib/domain/services/SQSPublishService';

import { MockPaymentMethodRepo } from '../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentMethodRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockPaymentRepo } from '../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockErpReferenceRepo } from '../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

import { GenerateInvoiceCompensatoryEventsUsecase } from '../../../../../../src/lib/modules/invoices/usecases/generateInvoiceCompensatoryEvents';

import {
  addBillingAddresses,
  addPaymentMethods,
  addInvoiceItems,
  addManuscripts,
  addInvoices,
  addPayments,
  addCoupons,
  addWaivers,
  addPayers,
  addErpReferences,
} from './testUtils';

import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';

let mockPaymentMethodRepo: MockPaymentMethodRepo;
let mockSqsPublishService: MockSqsPublishService;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockManuscriptRepo: MockArticleRepo;
let mockAddressRepo: MockAddressRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockPaymentRepo: MockPaymentRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockPayerRepo: MockPayerRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let loggerService: LoggerContract;

let useCase: GenerateInvoiceCompensatoryEventsUsecase;
let context: UsecaseAuthorizationContext;

let payload;
let event;

Before({ tags: '@ValidateGenerateCompensatoryEvents' }, function () {
  mockSqsPublishService = new MockSqsPublishService();
  mockPaymentMethodRepo = new MockPaymentMethodRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockAddressRepo = new MockAddressRepo();
  mockPaymentRepo = new MockPaymentRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockPayerRepo = new MockPayerRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );

  context = {
    roles: [Roles.SERVICE],
  };
  loggerService = new MockLogger();
  addPaymentMethods(mockPaymentMethodRepo);
  addBillingAddresses(mockAddressRepo);
  addInvoiceItems(mockInvoiceItemRepo);
  addManuscripts(mockManuscriptRepo);
  addInvoices(mockInvoiceRepo);
  addPayments(mockPaymentRepo);
  addCoupons(mockCouponRepo);
  addWaivers(mockWaiverRepo);
  addPayers(mockPayerRepo);
  addErpReferences(mockErpReferenceRepo);

  useCase = new GenerateInvoiceCompensatoryEventsUsecase(
    mockPaymentMethodRepo,
    mockInvoiceItemRepo,
    mockSqsPublishService,
    mockManuscriptRepo,
    mockAddressRepo,
    mockInvoiceRepo,
    mockPaymentRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPayerRepo,
    loggerService
  );
});

Given('There is an Invoice marked as FINAL', async function () {
  payload = { invoiceId: '1' };
});

Given(
  'There is an Invoice marked as DRAFT with NO acceptance date',
  async function () {
    payload = { invoiceId: '2' };
  }
);

Given(
  'There is an Invoice marked as DRAFT with acceptance date',
  async function () {
    payload = { invoiceId: '5' };
  }
);

Given(
  'There is an Invoice marked as ACTIVE with acceptance date and issued date',
  async function () {
    payload = { invoiceId: '3' };
  }
);

Given('There is an Invoice marked as PENDING', async function () {
  payload = { invoiceId: '4' };
});

Given('There is a Credit Note', async function () {
  payload = { invoiceId: '7' };
});

When('I try to generate a compensatory event', async function () {
  await useCase.execute(payload, context);
});

Then(/^It should send an (.+) Event$/, async function (eventName: string) {
  event = mockSqsPublishService.findEvent(eventName);
  expect(Object.keys(event).length).to.be.greaterThan(0);
});

Then('No Credit Note is created', async function () {
  expect(event.data.isCreditNote).to.equal(false);
});

Then('It should not send any event', async function () {
  expect(mockSqsPublishService.messages.length).to.equal(0);
});
