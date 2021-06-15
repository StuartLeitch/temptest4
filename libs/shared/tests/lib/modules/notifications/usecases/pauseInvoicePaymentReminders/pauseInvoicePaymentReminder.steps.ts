import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';
import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../src/lib/shared';

import { PauseInvoicePaymentRemindersResponse } from '../../../../../../src/lib/modules/notifications/usecases/pauseInvoicePaymentReminders/pauseInvoicePaymentRemindersResponse';
import { PauseInvoicePaymentRemindersUsecase } from '../../../../../../src/lib/modules/notifications/usecases/pauseInvoicePaymentReminders';

import {
  NotificationType,
  Notification,
} from '../../../../../../src/lib/modules/notifications/domain/Notification';
import { NotificationMap } from '../../../../../../src/lib/modules/notifications/mappers/NotificationMap';

import { NotificationPause } from '../../../../../../src/lib/modules/notifications/domain/NotificationPause';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';

import { MockSentNotificationRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockSentNotificationRepo';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';
import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';

function makeNotificationData(
  id: string,
  invoiceId: string,
  overwrites?: any
): Notification {
  const notification = NotificationMap.toDomain({
    recipientEmail: 'test-email',
    dateSent: new Date(),
    type: NotificationType.REMINDER_PAYMENT,
    id,
    invoiceId,
    ...overwrites,
  });

  if (notification.isLeft()) {
    throw notification.value;
  }

  return notification.value;
}

let mockPausedReminderRepo: MockPausedReminderRepo = null;
let mockSentNotificationRepo: MockSentNotificationRepo = null;
let mockInvoiceRepo: MockInvoiceRepo = null;
let mockInvoiceItemRepo: MockInvoiceItemRepo = null;
let mockArticleRepo: MockArticleRepo = null;
let mockErpReferenceRepo: MockErpReferenceRepo = null;
let mockLogger: MockLogger = null;
let notification: Notification = null;
let pausedReminder: NotificationPause = null;
let response: PauseInvoicePaymentRemindersResponse = null;
let usecase: PauseInvoicePaymentRemindersUsecase = null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before({ tags: '@ValidatePauseInvoicePaymentReminders' }, () => {
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockSentNotificationRepo = new MockSentNotificationRepo();
  mockArticleRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockLogger = new MockLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );

  usecase = new PauseInvoicePaymentRemindersUsecase(
    mockPausedReminderRepo,
    mockInvoiceRepo,
    mockLogger
  );
});

After({ tags: '@ValidatePauseInvoicePaymentReminders' }, () => {
  mockPausedReminderRepo = null;
  mockSentNotificationRepo = null;
  mockArticleRepo = null;
  mockErpReferenceRepo = null;
  mockLogger = null;
  mockInvoiceRepo = null;
  usecase = null;
});
Given(/^invoice with the "([\w-]+)" id/, async (testInvoiceId: string) => {
  const invoice = InvoiceMap.toDomain({
    transactionId: 'transaction-id',
    dateCreated: new Date(),
    id: testInvoiceId,
  });

  if (invoice.isLeft()) {
    throw invoice.value;
  }

  await mockInvoiceRepo.save(invoice.value);
});

Given(
  /^a notification with "([\w-]+)" id for the invoice "([\w-]+)"/,
  async (testNotificationId: string, testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));

    notification = makeNotificationData(testNotificationId, testInvoiceId);

    const maybeNotification = await mockSentNotificationRepo.save(notification);

    if (maybeNotification.isLeft()) {
      throw maybeNotification.value;
    }

    notification = maybeNotification.value;

    pausedReminder = { invoiceId, confirmation: false, payment: false };

    const maybePausedReminder = await mockPausedReminderRepo.save(
      pausedReminder
    );

    if (maybePausedReminder.isLeft()) {
      throw maybePausedReminder.value;
    }

    pausedReminder = maybePausedReminder.value;
  }
);

When(
  /^I try to pause payment reminders for "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute({ invoiceId: testInvoiceId }, context);
  }
);

Then(/^the payment reminder should be paused/, () => {
  expect(response.isRight()).to.be.true;
});

Then(/^the error that no pause state exists for reminder occurs/, () => {
  expect(response.isLeft()).to.be.true;
  expect(response.value)
    .to.have.property('message')
    .to.equal(
      'While saving the pause state an error ocurred: Entity(pause) with id[test-invoice-2] not found'
    );
});
