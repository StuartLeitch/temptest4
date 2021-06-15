import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { GuardFailure } from './../../../../../src/lib/core/logic/GuardFailure';
import { UseCaseError } from './../../../../../src/lib/core/logic/UseCaseError';
import { Either } from './../../../../../src/lib/core/logic/Either';

import { InvoiceId } from './../../../../../src/lib/modules/invoices/domain/InvoiceId';
import {
  NotificationType,
  Notification,
} from './../../../../../src/lib/modules/notifications/domain/Notification';

let maybeNotification: Either<GuardFailure | UseCaseError, Notification>;
let notification: Notification;

Before({ tags: '@ValidateNotification' }, function () {
  maybeNotification = null;
});

Given('There is a Notification Domain Entity', function () {
  return;
});

When(
  /^The Notification.create method is called for a given ID "([\w-]+)"$/,
  function (testNotificationId: string) {
    const notificationId = new UniqueEntityID(testNotificationId);
    const invoiceUUID = new UniqueEntityID();
    const invoiceId = InvoiceId.create(invoiceUUID);
    maybeNotification = Notification.create(
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
    expect(maybeNotification.isRight()).to.equal(true);

    if (maybeNotification.isLeft()) {
      throw maybeNotification.value;
    }

    notification = maybeNotification.value;
    expect(notification.id.toValue()).to.equal(testNotificationId);
  }
);
