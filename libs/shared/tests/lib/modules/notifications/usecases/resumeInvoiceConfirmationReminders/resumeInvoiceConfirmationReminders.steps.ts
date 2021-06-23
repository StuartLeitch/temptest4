import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { MockLogger } from '../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { SchedulerContract } from '../../../../../../src/lib/infrastructure/scheduler/Scheduler';

import { ResumeInvoiceConfirmationReminderUsecase } from '../../../../../../src/lib/modules/notifications/usecases/resumeInvoiceConfirmationReminders';
import { ResumeInvoiceConfirmationRemindersResponse } from '../../../../../../src/lib/modules/notifications/usecases/resumeInvoiceConfirmationReminders/resumeInvoiceConfirmationRemindersResponse';

import {
  Notification,
  NotificationType,
} from '../../../../../../src/lib/modules/notifications/domain/Notification';
import { NotificationPause } from '../../../../../../src/lib/modules/notifications/domain/NotificationPause';
import { NotificationMap } from '../../../../../../src/lib/modules/notifications/mappers/NotificationMap';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockSentNotificationRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockSentNotificationRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';
import { MockTransactionRepo } from './../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { PublisherMap } from '../../../../../../src/lib/modules/publishers/mappers/PublisherMap';
import { MockPublisherRepo } from '../../../../../../src/lib/modules/publishers/repos/mocks/mockPublisherRepo';

import {
  ArticleMap,
  CatalogMap,
  InvoiceItemMap,
  Roles,
  TransactionMap,
  TransactionStatus,
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
let mockInvoiceRepo: MockInvoiceRepo = null;
let mockInvoiceItemRepo: MockInvoiceItemRepo = null;
let mockArticleRepo: MockArticleRepo = null;
let mockErpReferenceRepo: MockErpReferenceRepo = null;
let mockLogger: MockLogger = null;
let mockTransactionRepo: MockTransactionRepo = null;
let mockCatalogRepo: MockCatalogRepo = null;
let mockPublisherRepo: MockPublisherRepo = null;
let scheduler: SchedulerContract = null;
let notification: Notification = null;
let pausedReminder: NotificationPause = null;
let response: ResumeInvoiceConfirmationRemindersResponse = null;
let usecase: ResumeInvoiceConfirmationReminderUsecase = null;

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before({ tags: '@ValidateResumeInvoiceConfirmationReminders' }, () => {
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
  mockPublisherRepo = new MockPublisherRepo();
  mockCatalogRepo = new MockCatalogRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockTransactionRepo = new MockTransactionRepo();

  usecase = new ResumeInvoiceConfirmationReminderUsecase(
    mockPausedReminderRepo,
    mockInvoiceItemRepo,
    mockTransactionRepo,
    mockArticleRepo,
    mockInvoiceRepo,
    mockLogger,
    scheduler
  );
});

After({ tags: '@ValidateResumeInvoiceConfirmationReminders' }, () => {
  mockPausedReminderRepo = null;
  mockSentNotificationRepo = null;
  mockArticleRepo = null;
  mockErpReferenceRepo = null;
  mockLogger = null;
  mockInvoiceRepo = null;
  mockPublisherRepo = null;
  mockCatalogRepo = null;
  mockInvoiceItemRepo = null;
  mockTransactionRepo = null;
});

Given(/^one invoice with id "([\w-]+)"/, async (testInvoiceId: string) => {
  const maybeTransaction = TransactionMap.toDomain({
    status: TransactionStatus.ACTIVE,
    deleted: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    id: 'testId',
  });

  if (maybeTransaction.isLeft()) {
    throw maybeTransaction.value;
  }

  const transaction = maybeTransaction.value;

  const maybeInvoice = InvoiceMap.toDomain({
    transactionId: 'testId',
    dateCreated: new Date(),
    id: testInvoiceId,
  });

  if (maybeInvoice.isLeft()) {
    throw maybeInvoice.value;
  }

  const invoice = maybeInvoice.value;

  const maybePublisher = PublisherMap.toDomain({
    id: 'testingPublisher',
    customValues: {},
  } as any);

  if (maybePublisher.isLeft()) {
    throw maybePublisher.value;
  }

  const publisher = maybePublisher.value;

  const maybeCatalog = CatalogMap.toDomain({
    publisherId: publisher.publisherId.id.toString(),
    isActive: true,
    journalId: 'testingJournal',
  });

  if (maybeCatalog.isLeft()) {
    throw maybeCatalog.value;
  }

  const catalog = maybeCatalog.value;

  const maybeManuscript = ArticleMap.toDomain({
    customId: '8888',
    journalId: catalog.journalId.id.toValue(),
    datePublished: new Date(),
  });

  if (maybeManuscript.isLeft()) {
    throw maybeManuscript.value;
  }

  const manuscript = maybeManuscript.value;

  const maybeInvoiceItem = InvoiceItemMap.toDomain({
    invoiceId: testInvoiceId,
    id: 'invoice-item',
    manuscriptId: manuscript.manuscriptId.id.toValue().toString(),
    price: 100,
    vat: 20,
  });

  if (maybeInvoiceItem.isLeft()) {
    throw maybeInvoiceItem.value;
  }

  const invoiceItem = maybeInvoiceItem.value;

  mockPublisherRepo.addMockItem(publisher);
  mockCatalogRepo.addMockItem(catalog);
  mockArticleRepo.addMockItem(manuscript);
  mockInvoiceItemRepo.addMockItem(invoiceItem);

  mockTransactionRepo.addMockItem(transaction);
  mockInvoiceRepo.addMockItem(invoice);
});

Given(
  /^the notification "([\w-]+)" for invoice "([\w-]+)"/,
  async (testNotificationId: string, testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));
    pausedReminder = {
      invoiceId,
      confirmation: true,
      payment: false,
    };
    mockPausedReminderRepo.addMockItem(pausedReminder);

    notification = makeNotificationData(testNotificationId, testInvoiceId);
    mockSentNotificationRepo.addMockItem(notification);
  }
);

Given(
  /^the notification "([\w-]+)" for confirmed invoice "([\w-]+)"/,
  async (testNotificationId: string, testInvoiceId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(testInvoiceId));
    pausedReminder = {
      invoiceId,
      confirmation: false,
      payment: false,
    };
    mockPausedReminderRepo.addMockItem(pausedReminder);

    notification = makeNotificationData(testNotificationId, testInvoiceId);
    mockSentNotificationRepo.addMockItem(notification);
  }
);

When(
  /^I try to resume confirmation reminders for "([\w-]+)"/,
  async (testInvoiceId: string) => {
    response = await usecase.execute(
      { reminderDelay: 5, invoiceId: testInvoiceId, queueName: 'test-queue' },
      context
    );
  }
);

Then(/^it should resume the reminders of type confirmation/, () => {
  expect(response.isRight()).to.be.true;
});

Then(
  /^it should return an error that the confirmation reminders were not paused/,
  () => {
    expect(response.isLeft()).to.be.true;
    expect(response.value)
      .to.have.property('message')
      .to.equal(
        'The confirmation reminders for invoice with id {confirmed-invoice} wore not paused.'
      );
  }
);
