import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { PublishMessage } from './../../../../../../src/lib/domain/services/sqs/PublishMessage';
import { LoggerContract, MockLogger } from './../../../../../../src/lib/infrastructure/logging';
import { SQSPublishServiceContract } from './../../../../../../src/lib/domain/services/SQSPublishService';

import { MockPaymentMethodRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentMethodRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from './../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockPaymentRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentRepo';
import { MockCouponRepo } from './../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from './../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from './../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';


import { GenerateCompensatoryEventsContext, GenerateCompensatoryEventsUsecase } from './../../../../../../src/lib/modules/invoices/usecases/generateCompensatoryEvents/generateCompensatoryEvents';

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
} from './testUtils';

import { Roles } from './../../../../../../src/lib/modules/users/domain/enums/Roles';

class MockSQSPublishService implements SQSPublishServiceContract {
  messages: PublishMessage[] = [];

  async publishMessage(message: PublishMessage): Promise<void> {
    this.messages.push(message);
  }
}

let mockPaymentMethodRepo: MockPaymentMethodRepo;
let mockSqsPublishService: MockSQSPublishService;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockManuscriptRepo: MockArticleRepo;
let mockAddressRepo: MockAddressRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockPaymentRepo: MockPaymentRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockPayerRepo: MockPayerRepo;
let loggerService: LoggerContract;

let useCase: GenerateCompensatoryEventsUsecase;
let context: GenerateCompensatoryEventsContext;

let payload;
let event;

Before(function() {
  mockSqsPublishService = new MockSQSPublishService();
  mockPaymentMethodRepo = new MockPaymentMethodRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockManuscriptRepo = new MockArticleRepo();
  mockAddressRepo = new MockAddressRepo();
  mockInvoiceRepo = new MockInvoiceRepo();
  mockPaymentRepo = new MockPaymentRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockPayerRepo = new MockPayerRepo();

  context = {
    roles: [Roles.ADMIN],
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

  useCase = new GenerateCompensatoryEventsUsecase(
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

Given("There is an Invoice marked as FINAL", async function() {
  payload = { invoiceId: '1'};
});

Given("There is an Invoice marked as DRAFT with NO acceptance date", async function() {
  payload = { invoiceId: '2'};
});

Given("There is an Invoice marked as DRAFT with acceptance date", async function() {
  payload = { invoiceId: '5'};
});

Given("There is an Invoice marked as ACTIVE with acceptance date and issued date", async function() {
  payload = { invoiceId: '3'};
});

Given("There is an Invoice marked as PENDING", async function() {
  payload = { invoiceId: '4'};
});

Given("There is a Credit Note", async function() {
  payload = { invoiceId: '7'};
});

When("I try to generate a compensatory event", async function() {
   await useCase.execute(
    payload,
    context
  );
});

Then(/^It should send an (.+) Event$/, async function (
  eventName: string
) {
  event = mockSqsPublishService.messages.find(message => message.event === eventName);
  expect(Object.keys(event).length).to.be.greaterThan(0);
});

Then("No Credit Note is created", async function() {
  expect(event.data.isCreditNote).to.equal(false);
});

Then("It should not send any event", async function() {
  expect(mockSqsPublishService.messages.length).to.equal(0);
});
