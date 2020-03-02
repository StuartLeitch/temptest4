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

import { Logger } from './logger';
const logger = new Logger('Usecase:Aspect');

const watchList = [
  GetPaymentMethodsUseCase,
  EpicOnArticlePublishedUsecase,
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
  AddCatalogItemToCatalogUseCase
];
const aspect = {
  classes: watchList,
  methods: watchList.map((usecaseClass: any) => usecaseClass.prototype.execute)
};

export class LoggerAspect {
  @beforeMethod({
    classes: [
      GetPaymentMethodsUseCase,
      EpicOnArticlePublishedUsecase,
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
      AddCatalogItemToCatalogUseCase
    ],
    methods: [
      GetPaymentMethodsUseCase.prototype.execute,
      EpicOnArticlePublishedUsecase.prototype.execute,
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
      AddCatalogItemToCatalogUseCase.prototype.execute
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
    classes: [
      GetPaymentMethodsUseCase,
      EpicOnArticlePublishedUsecase,
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
      AddCatalogItemToCatalogUseCase
    ],
    methods: [
      GetPaymentMethodsUseCase.prototype.execute,
      EpicOnArticlePublishedUsecase.prototype.execute,
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
      AddCatalogItemToCatalogUseCase.prototype.execute
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
