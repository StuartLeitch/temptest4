import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

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
} from '../../../../../../src/lib/shared';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

let mockPausedReminderRepo: MockPausedReminderRepo = null;
let mockInvoiceRepo: MockInvoiceRepo = null;
let mockInvoiceItemRepo: MockInvoiceItemRepo = null;
let mockArticleRepo: MockArticleRepo = null;
let mockErpReferenceRepo: MockErpReferenceRepo = null;
let mockLogger: MockLogger = null;
let pausedReminderState: NotificationPause = null;
let response: GetRemindersPauseStateForInvoiceResponse = null;
let usecase: GetRemindersPauseStateForInvoiceUsecase = null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before({ tags: '@ValidateGetRemindersPauseState' }, () => {
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

After({ tags: '@ValidateGetRemindersPauseState' }, () => {
  mockPausedReminderRepo = null;
  mockArticleRepo = null;
  mockErpReferenceRepo = null;
  mockInvoiceItemRepo = null;
  mockLogger = null;
  mockInvoiceRepo = null;
  usecase = null;
});

Given(/^invoice with "([\w-]+)" id/, async (testId: string) => {
  const invoice = InvoiceMap.toDomain({
    transactionId: 'transactionTest',
    dateCreated: new Date(),
    id: testId,
  });

  if (invoice.isLeft()) {
    throw invoice.value;
  }

  await mockInvoiceRepo.save(invoice.value);
});

Given(
  /^the paused state reminders for invoice "([\w-]+)"/,
  async (testId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testId));

    pausedReminderState = { invoiceId, confirmation: false, payment: false };

    const maybePausedReminderState = await mockPausedReminderRepo.save(
      pausedReminderState
    );

    if (maybePausedReminderState.isLeft()) {
      throw maybePausedReminderState.value;
    }

    pausedReminderState = maybePausedReminderState.value;
  }
);
When(
  /^I try to fetch paused reminders for invoice "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute({ invoiceId: testInvoiceId }, context);
  }
);

Then(/^I should receive reminders/, () => {
  expect(response.isRight()).to.be.true;
  expect(response.value).to.have.property('confirmation').to.equal(false);
  expect(response.value).to.have.property('payment').to.equal(false);
});

Then(/^I should obtain an error that the pause state does not exist/, () => {
  expect(response.isLeft()).to.equal(true);
  expect(response.value)
    .to.have.property('message')
    .to.equal(
      'While getting the pause state an error ocurred: Entity(pause) with id[nostate-invoice] not found'
    );
});
