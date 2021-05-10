import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';

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
  return NotificationMap.toDomain({
    recipientEmail: 'test-email',
    dateSent: new Date(),
    type: NotificationType.REMINDER_CONFIRMATION,
    id,
    invoiceId,
    ...overwrites,
  });
}

let mockPausedReminderRepo: MockPausedReminderRepo;
let mockSentNotificationRepo: MockSentNotificationRepo;
let mockLogger: MockLogger;
let usecase: AreNotificationsPausedUsecase;
let response: AreNotificationsPausedResponse;
let pausedNotification: NotificationPause;
let notification: Notification;

const context: UsecaseAuthorizationContext = { roles: [Roles.ADMIN] };

Before(() => {
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockSentNotificationRepo = new MockSentNotificationRepo();
  mockLogger = new MockLogger();
  usecase = new AreNotificationsPausedUsecase(
    mockPausedReminderRepo,
    mockLogger
  );
});

Given(
  /^an invoice with id "([\w-]+)" with confirmation reminder notification/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();
    pausedNotification = { invoiceId, confirmation: false, payment: false };
    pausedNotification = await mockPausedReminderRepo.save(pausedNotification);

    notification = makeNotificationData('testNotificationId', testInvoiceId);
    notification = await mockSentNotificationRepo.save(notification);
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

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();

    const pausedReminder = await mockPausedReminderRepo.getNotificationPausedStatus(
      invoiceId
    );

    expect(!!pausedReminder).to.be.true;
  }
);

Then(/^I should not return any reminders/, () => {
  expect(response.isLeft()).to.be.true;
});
