import { beforeMethod, afterMethod, Metadata } from 'aspect.js';

import {
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
  GetJournalUsecase,
  Logger,
} from '@hindawi/shared';

const logger = new Logger();
logger.setScope('Usecase:Aspect');

const watchList = [
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  GetManuscriptByManuscriptIdUsecase,
  SoftDeleteDraftTransactionUsecase,
  EditManuscriptUsecase,
  UpdateInvoiceItemsUsecase,
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetItemsForInvoiceUsecase,
  GetJournalUsecase,
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
      CreateTransactionUsecase.prototype.execute,
      CreateManuscriptUsecase.prototype.execute,
      GetManuscriptByManuscriptIdUsecase.prototype.execute,
      SoftDeleteDraftTransactionUsecase.prototype.execute,
      EditManuscriptUsecase.prototype.execute,
      UpdateInvoiceItemsUsecase.prototype.execute,
      GetInvoiceIdByManuscriptCustomIdUsecase.prototype.execute,
      GetItemsForInvoiceUsecase.prototype.execute,
      GetJournalUsecase.prototype.execute,
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
      CreateTransactionUsecase.prototype.execute,
      CreateManuscriptUsecase.prototype.execute,
      GetManuscriptByManuscriptIdUsecase.prototype.execute,
      SoftDeleteDraftTransactionUsecase.prototype.execute,
      EditManuscriptUsecase.prototype.execute,
      UpdateInvoiceItemsUsecase.prototype.execute,
      GetInvoiceIdByManuscriptCustomIdUsecase.prototype.execute,
      GetItemsForInvoiceUsecase.prototype.execute,
      GetJournalUsecase.prototype.execute,
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
