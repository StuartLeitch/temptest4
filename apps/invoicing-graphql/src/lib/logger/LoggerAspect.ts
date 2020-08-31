/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { beforeMethod, afterMethod, Metadata } from 'aspect.js';

import {
  ScheduleRemindersForExistingInvoicesUsecase,
  UpdateTransactionOnAcceptManuscriptUsecase,
  PauseInvoiceConfirmationRemindersUsecase,
  ResumeInvoiceConfirmationReminderUsecase,
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetRemindersPauseStateForInvoiceUsecase,
  SendInvoiceCreditControlReminderUsecase,
  SendInvoiceConfirmationReminderUsecase,
  GetSentNotificationForInvoiceUsecase,
  AddEmptyPauseStateForInvoiceUsecase,
  PauseInvoicePaymentRemindersUsecase,
  ResumeInvoicePaymentReminderUsecase,
  GetManuscriptByManuscriptIdUsecase,
  GetPayerDetailsByInvoiceIdUsecase,
  SendInvoicePaymentReminderUsecase,
  SoftDeleteDraftTransactionUsecase,
  UpdateCatalogItemToCatalogUseCase,
  AddCatalogItemToCatalogUseCase,
  AreNotificationsPausedUsecase,
  AssignEditorsToJournalUsecase,
  PayPalPaymentApprovedUsecase,
  PayPalProcessFinishedUsecase,
  UpdateInvoiceItemsUsecase,
  GetItemsForInvoiceUsecase,
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  EditManuscriptUsecase,
  GetPaymentInfoUsecase,
  RecordPaymentUsecase,
  GetJournal,
  Logger,
} from '@hindawi/shared';

// import { Logger } from '../../../../../libs/shared/src/lib/infrastructure/logging/implementations/Logger';
const logger = new Logger();
logger.setScope('Usecase:Aspect');

const watchList = [
  // GetPaymentMethodsUseCase,

  // Phenom Events handling usecases
  // EpicOnArticlePublishedUsecase,
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  GetManuscriptByManuscriptIdUsecase,
  SoftDeleteDraftTransactionUsecase,
  EditManuscriptUsecase,
  UpdateInvoiceItemsUsecase,
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetItemsForInvoiceUsecase,
  GetJournal,
  UpdateTransactionOnAcceptManuscriptUsecase,
  UpdateCatalogItemToCatalogUseCase,
  AssignEditorsToJournalUsecase,
  AddCatalogItemToCatalogUseCase,
  SendInvoiceCreditControlReminderUsecase,
  SendInvoiceConfirmationReminderUsecase,
  SendInvoicePaymentReminderUsecase,
  PauseInvoiceConfirmationRemindersUsecase,
  PauseInvoicePaymentRemindersUsecase,
  ResumeInvoiceConfirmationReminderUsecase,
  ResumeInvoicePaymentReminderUsecase,
  GetRemindersPauseStateForInvoiceUsecase,
  GetSentNotificationForInvoiceUsecase,
  AreNotificationsPausedUsecase,
  AddEmptyPauseStateForInvoiceUsecase,
  ScheduleRemindersForExistingInvoicesUsecase,
  GetPayerDetailsByInvoiceIdUsecase,
  GetPaymentInfoUsecase,
  RecordPaymentUsecase,
  PayPalPaymentApprovedUsecase,
  PayPalProcessFinishedUsecase,
];
const aspect = {
  classes: watchList,
  methods: watchList.map((usecaseClass: any) =>
    usecaseClass.prototype.execute.bind(usecaseClass)
  ),
};

export class LoggerAspect {
  @beforeMethod({
    classes: aspect.classes,
    methods: [
      // GetPaymentMethodsUseCase.prototype.execute,
      // Phenom Events handling usecases
      // EpicOnArticlePublishedUsecase.prototype.execute,
      CreateTransactionUsecase.prototype.execute,
      CreateManuscriptUsecase.prototype.execute,
      GetManuscriptByManuscriptIdUsecase.prototype.execute,
      SoftDeleteDraftTransactionUsecase.prototype.execute,
      EditManuscriptUsecase.prototype.execute,
      UpdateInvoiceItemsUsecase.prototype.execute,
      GetInvoiceIdByManuscriptCustomIdUsecase.prototype.execute,
      GetItemsForInvoiceUsecase.prototype.execute,
      GetJournal.prototype.execute,
      UpdateTransactionOnAcceptManuscriptUsecase.prototype.execute,
      UpdateCatalogItemToCatalogUseCase.prototype.execute,
      AssignEditorsToJournalUsecase.prototype.execute,
      AddCatalogItemToCatalogUseCase.prototype.execute,
      SendInvoiceCreditControlReminderUsecase.prototype.execute,
      SendInvoiceConfirmationReminderUsecase.prototype.execute,
      SendInvoicePaymentReminderUsecase.prototype.execute,
      PauseInvoiceConfirmationRemindersUsecase.prototype.execute,
      PauseInvoicePaymentRemindersUsecase.prototype.execute,
      ResumeInvoiceConfirmationReminderUsecase.prototype.execute,
      ResumeInvoicePaymentReminderUsecase.prototype.execute,
      GetRemindersPauseStateForInvoiceUsecase.prototype.execute,
      GetSentNotificationForInvoiceUsecase.prototype.execute,
      AreNotificationsPausedUsecase.prototype.execute,
      AddEmptyPauseStateForInvoiceUsecase.prototype.execute,
      ScheduleRemindersForExistingInvoicesUsecase.prototype.execute,
      GetPayerDetailsByInvoiceIdUsecase.prototype.execute,
      GetPaymentInfoUsecase.prototype.execute,
      RecordPaymentUsecase.prototype.execute,
      PayPalPaymentApprovedUsecase.prototype.execute,
      PayPalProcessFinishedUsecase.prototype.execute,
    ],
  })
  invokeBeforeMethod(meta: Metadata) {
    logger.info('beforeExecute', {
      usecaseClassName: meta.className,
      usecaseMethodName: meta.method.name,
      request: meta.method.args,
    });
  }

  @afterMethod({
    classes: aspect.classes,
    methods: [
      // GetPaymentMethodsUseCase.prototype.execute,
      // EpicOnArticlePublishedUsecase.prototype.execute,
      CreateTransactionUsecase.prototype.execute,
      CreateManuscriptUsecase.prototype.execute,
      GetManuscriptByManuscriptIdUsecase.prototype.execute,
      SoftDeleteDraftTransactionUsecase.prototype.execute,
      EditManuscriptUsecase.prototype.execute,
      UpdateInvoiceItemsUsecase.prototype.execute,
      GetInvoiceIdByManuscriptCustomIdUsecase.prototype.execute,
      GetItemsForInvoiceUsecase.prototype.execute,
      GetJournal.prototype.execute,
      UpdateTransactionOnAcceptManuscriptUsecase.prototype.execute,
      UpdateCatalogItemToCatalogUseCase.prototype.execute,
      AssignEditorsToJournalUsecase.prototype.execute,
      AddCatalogItemToCatalogUseCase.prototype.execute,
      SendInvoiceCreditControlReminderUsecase.prototype.execute,
      SendInvoiceConfirmationReminderUsecase.prototype.execute,
      SendInvoicePaymentReminderUsecase.prototype.execute,
      PauseInvoiceConfirmationRemindersUsecase.prototype.execute,
      PauseInvoicePaymentRemindersUsecase.prototype.execute,
      ResumeInvoiceConfirmationReminderUsecase.prototype.execute,
      ResumeInvoicePaymentReminderUsecase.prototype.execute,
      GetRemindersPauseStateForInvoiceUsecase.prototype.execute,
      GetSentNotificationForInvoiceUsecase.prototype.execute,
      AreNotificationsPausedUsecase.prototype.execute,
      AddEmptyPauseStateForInvoiceUsecase.prototype.execute,
      ScheduleRemindersForExistingInvoicesUsecase.prototype.execute,
      GetPayerDetailsByInvoiceIdUsecase.prototype.execute,
      GetPaymentInfoUsecase.prototype.execute,
      RecordPaymentUsecase.prototype.execute,
      PayPalPaymentApprovedUsecase.prototype.execute,
      PayPalProcessFinishedUsecase.prototype.execute,
    ],
  })
  async invokeAfterMethod(meta: Metadata) {
    const result = await meta.method.result;
    logger.info('afterExecute', {
      usecaseClassName: meta.className,
      usecaseMethodName: meta.method.name,
      result,
    });
  }
}
