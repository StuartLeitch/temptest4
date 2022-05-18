import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import {
  MockLogger,
  MockLoggerBuilder,
} from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';

import { AddEmptyPauseStateForInvoiceUsecase } from '../../../../../../src/lib/modules/notifications/usecases/addEmptyPauseStateForInvoice';
import { AddEmptyPauseStateForInvoiceResponse } from '../../../../../../src/lib/modules/notifications/usecases/addEmptyPauseStateForInvoice/addEmptyPauseStateForInvoiceResponse';

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
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

let mockPausedReminderRepo: MockPausedReminderRepo = null;
let mockInvoiceRepo: MockInvoiceRepo = null;
let mockInvoiceItemRepo: MockInvoiceItemRepo = null;
let mockArticleRepo: MockArticleRepo = null;
let mockErpReferenceRepo: MockErpReferenceRepo = null;
let mockLogger: MockLogger = null;
let pausedReminderState: NotificationPause = null;
let response: AddEmptyPauseStateForInvoiceResponse = null;
let usecase: AddEmptyPauseStateForInvoiceUsecase = null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before({ tags: '@ValidateEmptyStateForInvoice' }, () => {
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockArticleRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockLogger = new MockLoggerBuilder().getLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );

  usecase = new AddEmptyPauseStateForInvoiceUsecase(
    mockPausedReminderRepo,
    mockInvoiceRepo,
    mockLogger
  );
});

After({ tags: '@ValidateEmptyStateForInvoice' }, () => {
  mockPausedReminderRepo = null;
  mockArticleRepo = null;
  mockErpReferenceRepo = null;
  mockInvoiceItemRepo = null;
  mockLogger = null;
  mockInvoiceRepo = null;
  usecase = null;
});

Given(/^an invoice with the id "([\w-]+)"/, async (testInvoiceId: string) => {
  const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));
  pausedReminderState = { invoiceId, confirmation: false, payment: false };

  const maybePausedReminderState = await mockPausedReminderRepo.save(
    pausedReminderState
  );

  if (maybePausedReminderState.isLeft()) {
    throw maybePausedReminderState.value;
  }

  pausedReminderState = maybePausedReminderState.value;
});

When(
  /^I try to insert a new empty pause reminder with invoice id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute(
      {
        invoiceId: testInvoiceId,
      },
      context
    );
  }
);

Then(
  /^the empty pause reminder for invoice "([\w-]+)" should be added/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));

    const maybePausedReminder =
      await mockPausedReminderRepo.getNotificationPausedStatus(invoiceId);

    if (maybePausedReminder.isLeft()) {
      throw maybePausedReminder.value;
    }

    const pausedReminder = maybePausedReminder.value;

    expect(pausedReminder.payment).to.equal(false);
    expect(pausedReminder.confirmation).to.equal(false);
  }
);

Then(/^I should receive an error that the invoice was not found/, () => {
  expect(response.isLeft()).to.equal(true);
});
