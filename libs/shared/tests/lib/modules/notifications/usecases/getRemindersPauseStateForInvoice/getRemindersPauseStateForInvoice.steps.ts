import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';

import { GetRemindersPauseStateForInvoiceUsecase } from '../../../../../../src/lib/modules/notifications/usecases/getRemindersPauseStateForInvoice';
import { GetRemindersPauseStateForInvoiceResponse } from '../../../../../../src/lib/modules/notifications/usecases/getRemindersPauseStateForInvoice/getRemindersPauseStateForInvoiceResponse';

import { NotificationPause } from '../../../../../../src/lib/modules/notifications/domain/NotificationPause';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

import {
  Roles,
  UsecaseAuthorizationContext,
  InvoiceMap,
  Invoice,
} from '../../../../../../src/lib/shared';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

let mockPausedReminderRepo: MockPausedReminderRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockArticleRepo: MockArticleRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let mockLogger: MockLogger;
let pausedReminderState: NotificationPause;
let response: GetRemindersPauseStateForInvoiceResponse;
let usecase: GetRemindersPauseStateForInvoiceUsecase;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before(() => {
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockArticleRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockLogger = new MockLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );

  usecase = new GetRemindersPauseStateForInvoiceUsecase(
    mockPausedReminderRepo,
    mockInvoiceRepo,
    mockLogger
  );
});

Given(/^an invoice id "([\w-]+)"/, async (testInvoiceId: string) => {
  const invoice = InvoiceMap.toDomain({
    transactionId: 'transaction-id',
    dateCreated: new Date(),
    id: testInvoiceId,
  });

  const invoiceId = InvoiceId.create(
    new UniqueEntityID(testInvoiceId)
  ).getValue();
  await mockInvoiceRepo.save(invoice);
  pausedReminderState = { invoiceId, confirmation: false, payment: false };
  pausedReminderState = await mockPausedReminderRepo.save(pausedReminderState);
});

When(
  /^I try to fetch paused reminders for invoice "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute({ invoiceId: testInvoiceId }, context);
  }
);

Then(/^I should receive reminders/, () => {
  // expect(response.isRight()).to.be.true;
  // expect(!!pausedReminderState).to.be.true;
});

Then(/^I should obtain an error/, () => {
  expect(response.isLeft()).to.be.true;
  expect(!!pausedReminderState).to.be.false;
});
