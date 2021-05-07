import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { Result } from './../../../../../src/lib/core/logic/Result';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import {
  Notification,
  NotificationType,
} from './../../../../../src/lib/modules/notifications/domain/Notification';
import { InvoiceId } from './../../../../../src/lib/modules/invoices/domain/InvoiceId';

let notificationOrError: Result<Notification>;
let notification;

Before(function () {
  notificationOrError = null;
});

Given('There is a Notification Domain Entity', function () {
  return;
});

When(
  /^The Notification.create method is called for a given ID "([\w-]+)"$/,
  function (testNotificationId: string) {
    const notificationId = new UniqueEntityID(testNotificationId);
    const invoiceUUID = new UniqueEntityID();
    const invoiceId = InvoiceId.create(invoiceUUID).getValue();
    notificationOrError = Notification.create(
      {
        recipientEmail: 'test-recipient',
        type: NotificationType.INVOICE_CREATED,
        invoiceId,
      },
      notificationId
    );
  }
);

Then(
  /^A new Notification is successfully created with ID "([\w-]+)"$/,
  function (testNotificationId: string) {
    expect(notificationOrError.isSuccess).to.equal(true);
    notification = notificationOrError.getValue();
    expect(notification.id.toValue()).to.equal(testNotificationId);
  }
);
