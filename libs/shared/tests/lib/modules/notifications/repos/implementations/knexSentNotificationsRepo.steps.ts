import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import {
  Notification,
  NotificationType,
} from '../../../../../../src/lib/modules/notifications/domain/Notification';
import { NotificationId } from '../../../../../../src/lib/modules/notifications/domain/NotificationId';
import { NotificationMap } from '../../../../../../src/lib/modules/notifications/mappers/NotificationMap';

import { MockSentNotificationRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockSentNotificationRepo';

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

let mockSentNotificationRepo: MockSentNotificationRepo;
let notification: Notification;
let notificationList: Notification[];
let foundNotification: Notification;
let addedNotification: Notification;

Before(async () => {
  mockSentNotificationRepo = new MockSentNotificationRepo();
});

Given(
  /^a notification with the id "([\w-]+)" and invoice id "([\w-]+)"$/,
  async (testNotificationId: string, testInvoiceId: string) => {
    notification = makeNotificationData(testNotificationId, testInvoiceId);
    notification = await mockSentNotificationRepo.save(notification);
  }
);

When(
  /^we call getNotificationById for "([\w-]+)"$/,
  async (testNotificationId: string) => {
    const notificationId = NotificationId.create(
      new UniqueEntityID(testNotificationId)
    ).getValue();
    foundNotification = await mockSentNotificationRepo.getNotificationById(
      notificationId
    );
  }
);

Then(/^getNotificationById returns the Notification/, async () => {
  expect(foundNotification.id.toValue()).to.equal(
    notification.notificationId.id.toValue()
  );
});

When(
  /^we call getNotificationsByInvoiceId with "([\w-]+)"$/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();
    notificationList = await mockSentNotificationRepo.getNotificationsByInvoiceId(
      invoiceId
    );
  }
);

Then(
  /^getNotificationsByInvoiceId returns the (\d+) notifications/,
  async (count: Number) => {
    expect(notificationList.length).to.equal(count);
  }
);

Then(/^getNotificationsByInvoiceId returns null/, async () => {
  expect(notificationList).to.equal(null);
});

When(
  /^we call getNotificationsByRecipient with "([\w-]+)"$/,
  async (testEmail: string) => {
    notificationList = await mockSentNotificationRepo.getNotificationsByRecipient(
      testEmail
    );
  }
);

Then(
  /^getNotificationsByRecipient returns the (\d+) notifications/,
  async (count: Number) => {
    expect(notificationList.length).to.equal(count);
  }
);

Then(/^getNotificationsByRecipient returns null/, async () => {
  expect(notificationList).to.equal(null);
});

When(
  /^we call getNotificationsByType with "([\w-]+)"$/,
  async (testEmail: string) => {
    if (testEmail === NotificationType.REMINDER_CONFIRMATION) {
      notificationList = await mockSentNotificationRepo.getNotificationsByType(
        NotificationType.REMINDER_CONFIRMATION
      );
    } else {
      notificationList = null;
    }
  }
);

Then(
  /^getNotificationsByType returns the (\d+) notifications/,
  async (count: Number) => {
    expect(notificationList.length).to.equal(count);
  }
);

Then(/^getNotificationsByType returns null/, async () => {
  expect(notificationList).to.equal(null);
});

When(/^we call addNotification with a new notification/, async () => {
  const newNotification = makeNotificationData(
    'new-test-notification',
    'new-test-id'
  );
  addedNotification = await mockSentNotificationRepo.addNotification(
    newNotification
  );
  notificationList.push(addedNotification);
});

Then(/^a new notification should be added/, async () => {
  expect(notificationList.length).to.equal(3);
});
