import { beforeMethod, afterMethod, Metadata } from 'aspect.js';

import { EpicOnArticlePublishedUsecase } from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/epicOnArticlePublished';
import { GetPaymentMethodsUseCase } from './../../../../../libs/shared/src/lib/modules/payments/usecases/getPaymentMethods/GetPaymentMethods';
import { CreateTransactionUsecase } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction';
import { CreateManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscript';
import { GetManuscriptByManuscriptIdUsecase } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/getManuscriptByManuscriptId/getManuscriptByManuscriptId';
import { SoftDeleteDraftTransactionUsecase } from './../../../../../libs/shared/src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';
import { EditManuscriptUsecase } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/editManuscript/editManuscript';
import { UpdateInvoiceItemsUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/updateInvoiceItems/updateInvoiceItems';
import { GetInvoiceIdByManuscriptCustomIdUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetItemsForInvoiceUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetJournal } from './../../../../../libs/shared/src/lib/modules/journals/usecases/journals/getJournal/getJournal';
import { UpdateTransactionOnAcceptManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';
import { UpdateCatalogItemToCatalogUseCase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/updateCatalogItem/updateCatalogItem';
import { AssignEditorsToJournalUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/editorialBoards/assignEditorsToJournal/assignEditorsToJournal';
import { AddCatalogItemToCatalogUseCase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalog';
import {
  ScheduleRemindersForExistingInvoicesUsecase,
  PauseInvoiceConfirmationRemindersUsecase,
  ResumeInvoiceConfirmationReminderUsecase,
  GetRemindersPauseStateForInvoiceUsecase,
  SendInvoiceCreditControlReminderUsecase,
  SendInvoiceConfirmationReminderUsecase,
  GetSentNotificationForInvoiceUsecase,
  AddEmptyPauseStateForInvoiceUsecase,
  PauseInvoicePaymentRemindersUsecase,
  ResumeInvoicePaymentReminderUsecase,
  GetPayerDetailsByInvoiceIdUsecase,
  SendInvoicePaymentReminderUsecase,
  AreNotificationsPausedUsecase
} from '@hindawi/shared';

import { Logger } from './logger';
const logger = new Logger('Usecase:Aspect');

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
  GetPayerDetailsByInvoiceIdUsecase
];
const aspect = {
  classes: watchList,
  methods: watchList.map((usecaseClass: any) =>
    usecaseClass.prototype.execute.bind(usecaseClass)
  )
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
      GetPayerDetailsByInvoiceIdUsecase.prototype.execute
    ]
  })
  invokeBeforeMethod(meta: Metadata) {
    logger.info('beforeExecute', {
      usecaseClassName: meta.className,
      usecaseMethodName: meta.method.name,
      request: meta.method.args
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
      GetPayerDetailsByInvoiceIdUsecase.prototype.execute
    ]
  })
  async invokeAfterMethod(meta: Metadata) {
    const result = await meta.method.result;
    logger.info('afterExecute', {
      usecaseClassName: meta.className,
      usecaseMethodName: meta.method.name,
      result
    });
  }
}
