import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../../../src/lib/core/domain/UniqueEntityID';

import { InvoiceId } from '../../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { NotificationPause } from '../../../../../../../src/lib/modules/notifications/domain/NotificationPause';
import { NotificationType } from '../../../../../../../src/lib/modules/notifications/domain/Notification';
import { MockPausedReminderRepo } from '../../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';

let mockPausedReminderRepo: MockPausedReminderRepo;
let pausedNotification: NotificationPause;
let foundPausedNotification: NotificationPause;
let savedPausedNotification: NotificationPause;
let pauseState;

Before(async () => {
  mockPausedReminderRepo = new MockPausedReminderRepo();
});

Given(
  /^an invoice with id "([\w-]+)" and a paused notification item$/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();
    pausedNotification = { invoiceId, confirmation: true, payment: false };
    pausedNotification = await mockPausedReminderRepo.save(pausedNotification);
  }
);

When(
  /^we call getNotificationPausedStatus for "([\w-]+)"$/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();

    foundPausedNotification = await mockPausedReminderRepo.getNotificationPausedStatus(
      invoiceId
    );
  }
);

Then(
  /^getNotificationPausedStatus returns the NotificationPause item$/,
  async () => {
    expect(foundPausedNotification.confirmation).to.equal(
      pausedNotification.confirmation
    );
    expect(foundPausedNotification.payment).to.equal(
      pausedNotification.payment
    );
  }
);

When(
  /^we call insertBasePause for "([\w-]+)"$/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();

    savedPausedNotification = await mockPausedReminderRepo.insertBasePause(
      invoiceId
    );
  }
);

Then(/^insertBasePause should save the new paused reminder/, async () => {
  expect(savedPausedNotification.confirmation).to.equal(false);
  expect(savedPausedNotification.payment).to.equal(false);
});
