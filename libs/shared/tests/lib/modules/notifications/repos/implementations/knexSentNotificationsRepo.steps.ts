import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

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

let mockSentNotificationRepo: MockSentNotificationRepo = null;
let notification: Notification = null;
let notificationList: Notification[] = null;
let foundNotification: Notification = null;
let addedNotification: Notification = null;

Before({ tags: '@ValidateKnexSentNotification' }, async () => {
  mockSentNotificationRepo = new MockSentNotificationRepo();
});

After({ tags: '@ValidateKnexSentNotification' }, () => {
  mockSentNotificationRepo = null;
});
Given(
  /^a notification with the id "([\w-]+)" and invoice id "([\w-]+)"$/,
  async (testNotificationId: string, testInvoiceId: string) => {
    notification = makeNotificationData(testNotificationId, testInvoiceId);
    const maybeNotification = await mockSentNotificationRepo.save(notification);

    if (maybeNotification.isLeft()) {
      throw maybeNotification.value;
    }

    notification = maybeNotification.value;
  }
);

When(
  /^we call getNotificationById for "([\w-]+)"$/,
  async (testNotificationId: string) => {
    const notificationId = NotificationId.create(
      new UniqueEntityID(testNotificationId)
    );

    const maybeFoundNotification = await mockSentNotificationRepo.getNotificationById(
      notificationId
    );

    if (maybeFoundNotification.isLeft()) {
      throw maybeFoundNotification.value;
    }

    foundNotification = maybeFoundNotification.value;
  }
);

Then(
  /^getNotificationById returns the Notification "([\w-]+)"/,
  async (testNotificationId: string) => {
    expect(foundNotification.id.toValue()).to.equal(testNotificationId);
  }
);

When(
  /^we call getNotificationsByInvoiceId with "([\w-]+)"$/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));

    const maybeNotificationList = await mockSentNotificationRepo.getNotificationsByInvoiceId(
      invoiceId
    );

    if (maybeNotificationList.isLeft()) {
      throw maybeNotificationList.value;
    }

    notificationList = maybeNotificationList.value;
  }
);

Then(
  /^getNotificationsByInvoiceId returns the (\d+) notifications/,
  async (count: Number) => {
    expect(notificationList.length).to.equal(count);
  }
);

Then(/^getNotificationsByInvoiceId returns null/, async () => {
  expect(notificationList.length).to.equal(0);
});

When(
  /^we call getNotificationsByRecipient with "([\w-]+)"$/,
  async (testEmail: string) => {
    const maybeNotificationList = await mockSentNotificationRepo.getNotificationsByRecipient(
      testEmail
    );

    if (maybeNotificationList.isLeft()) {
      throw maybeNotificationList.value;
    }

    notificationList = maybeNotificationList.value;
  }
);

Then(
  /^getNotificationsByRecipient returns the (\d+) notifications/,
  async (count: Number) => {
    expect(notificationList.length).to.equal(count);
  }
);

Then(/^getNotificationsByRecipient returns null/, async () => {
  expect(notificationList.length).to.equal(0);
});

When(
  /^we call getNotificationsByType with "([\w-]+)"$/,
  async (testType: string) => {
    if (testType === NotificationType.REMINDER_CONFIRMATION) {
      const maybeNotificationList = await mockSentNotificationRepo.getNotificationsByType(
        NotificationType.REMINDER_CONFIRMATION
      );

      if (maybeNotificationList.isLeft()) {
        throw maybeNotificationList.value;
      }

      notificationList = maybeNotificationList.value;
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

  const maybeAddedNotification = await mockSentNotificationRepo.addNotification(
    newNotification
  );

  if (maybeAddedNotification.isLeft()) {
    throw maybeAddedNotification.value;
  }

  addedNotification = maybeAddedNotification.value;

  notificationList.push(addedNotification);
});

Then(/^a new notification should be added/, async () => {
  expect(notificationList.length).to.equal(3);
});
