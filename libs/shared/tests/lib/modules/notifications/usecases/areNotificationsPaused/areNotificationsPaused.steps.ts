import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import {
  MockLogger,
  MockLoggerBuilder,
} from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';

import { AreNotificationsPausedUsecase } from '../../../../../../src/lib/modules/notifications/usecases/areNotificationsPaused';
import { AreNotificationsPausedResponse } from '../../../../../../src/lib/modules/notifications/usecases/areNotificationsPaused/areNotificationsPausedResponse';

import { NotificationPause } from '../../../../../../src/lib/modules/notifications/domain/NotificationPause';
import {
  NotificationType,
  Notification,
} from '../../../../../../src/lib/modules/notifications/domain/Notification';
import { NotificationMap } from '../../../../../../src/lib/modules/notifications/mappers/NotificationMap';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockSentNotificationRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockSentNotificationRepo';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

function makeNotificationData(
  id: string,
  invoiceId: string,
  overwrites?: any
): Notification {
  const notification = NotificationMap.toDomain({
    recipientEmail: 'test-email',
    dateSent: new Date(),
    type: NotificationType.REMINDER_CONFIRMATION,
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
let mockLogger: MockLogger = null;
let usecase: AreNotificationsPausedUsecase = null;
let response: AreNotificationsPausedResponse = null;
let pausedNotification: NotificationPause = null;
let notification: Notification = null;

const context: UsecaseAuthorizationContext = { roles: [Roles.ADMIN] };

Before({ tags: '@ValidateNotificationsPaused' }, () => {
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockSentNotificationRepo = new MockSentNotificationRepo();
  mockLogger = new MockLoggerBuilder().getLogger();
  usecase = new AreNotificationsPausedUsecase(
    mockPausedReminderRepo,
    mockLogger
  );
});

After({ tags: '@ValidateNotificationsPaused' }, () => {
  mockPausedReminderRepo = null;
  mockSentNotificationRepo = null;
  mockLogger = null;
  usecase = null;
});
Given(
  /^an invoice with id "([\w-]+)" with confirmation reminder notification/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));
    pausedNotification = { invoiceId, confirmation: false, payment: false };

    const maybePausedNotification = await mockPausedReminderRepo.save(
      pausedNotification
    );

    if (maybePausedNotification.isLeft()) {
      throw maybePausedNotification.value;
    }

    pausedNotification = maybePausedNotification.value;

    notification = makeNotificationData('testNotificationId', testInvoiceId);

    const maybeNotification = await mockSentNotificationRepo.save(notification);

    if (maybeNotification.isLeft()) {
      throw maybeNotification.value;
    }

    notification = maybeNotification.value;
  }
);

When(
  /^I try to get paused reminders for invoice id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute(
      {
        invoiceId: testInvoiceId,
        notificationType: NotificationType.REMINDER_PAYMENT,
      },
      context
    );
  }
);

Then(
  /^I should receive pause status for notification with invoice id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    expect(response.isRight()).to.be.true;

    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));

    const maybePausedReminder =
      await mockPausedReminderRepo.getNotificationPausedStatus(invoiceId);

    if (maybePausedReminder.isLeft()) {
      throw maybePausedReminder.value;
    }

    const pausedReminder = maybePausedReminder.value;

    expect(!!pausedReminder).to.be.true;
  }
);

Then(/^I should not return any reminders/, () => {
  expect(response.isLeft()).to.be.true;
});
