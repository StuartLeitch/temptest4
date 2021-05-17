import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';

import { GetSentNotificationForInvoiceUsecase } from '../../../../../../src/lib/modules/notifications/usecases/getSentNotificationForInvoice';
import { GetSentNotificationForInvoiceResponse } from '../../../../../../src/lib/modules/notifications/usecases/getSentNotificationForInvoice/getSentNotificationForInvoiceResponse';

import {
  Notification,
  NotificationType,
} from '../../../../../../src/lib/modules/notifications/domain/Notification';
import { NotificationMap } from '../../../../../../src/lib/modules/notifications/mappers/NotificationMap';
import { MockSentNotificationRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockSentNotificationRepo';
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

let mockSentNotificationRepo: MockSentNotificationRepo = null;
let mockInvoiceRepo: MockInvoiceRepo = null;
let mockInvoiceItemRepo: MockInvoiceItemRepo = null;
let mockArticleRepo: MockArticleRepo = null;
let mockErpReferenceRepo: MockErpReferenceRepo = null;
let mockLogger: MockLogger = null;
let notification: Notification = null;
let notificationList: Notification[] = null;
let response: GetSentNotificationForInvoiceResponse = null;
let usecase: GetSentNotificationForInvoiceUsecase = null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before({ tags: '@ValidateGetSentNotificationForInvoice' }, () => {
  mockSentNotificationRepo = new MockSentNotificationRepo();
  mockArticleRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockLogger = new MockLogger();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );

  usecase = new GetSentNotificationForInvoiceUsecase(
    mockSentNotificationRepo,
    mockInvoiceRepo,
    mockLogger
  );
});

After({ tags: '@ValidateGetSentNotificationForInvoice' }, () => {
  mockSentNotificationRepo = null;
  mockArticleRepo = null;
  mockErpReferenceRepo = null;
  mockLogger = null;
  mockInvoiceRepo = null;
  usecase = null;
});

Given(
  /^the invoice with given id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    const invoice = InvoiceMap.toDomain({
      transactionId: 'transaction-id',
      dateCreated: new Date(),
      id: testInvoiceId,
    });

    await mockInvoiceRepo.save(invoice);
  }
);

Given(
  /^the notification with "([\w-]+)" id for "([\w-]+)"/,
  async (testNotificationId: string, testInvoiceId: string) => {
    notification = makeNotificationData(testNotificationId, testInvoiceId);
    notification = await mockSentNotificationRepo.save(notification);
  }
);
When(
  /^I try to fetch notifications for invoice "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute({ invoiceId: testInvoiceId }, context);
  }
);

Then(
  /^I should receive notifications for id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(testInvoiceId)
    ).getValue();
    expect(response.isRight()).to.be.true;

    notificationList = await mockSentNotificationRepo.getNotificationsByInvoiceId(
      invoiceId
    );
    expect(!!notificationList).to.be.true;
    expect(notificationList.length).to.equal(2);

    expect(response.value.getValue()).to.not.equal(null);
  }
);

Then(/^I should not receive any notifications/, () => {
  expect(response.isRight()).to.be.true;
  expect(response.value.getValue()).to.equal(null);
});
