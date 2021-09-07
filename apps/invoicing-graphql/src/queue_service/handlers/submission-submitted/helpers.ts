/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { SubmissionSubmitted } from '@hindawi/phenom-events';

import {
  RestoreSoftDeleteDraftTransactionUsecase,
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetManuscriptByManuscriptIdUsecase,
  ExistsManuscriptByIdUsecase,
  SoftDeleteDraftTransactionUsecase,
  UsecaseAuthorizationContext,
  GetItemsForInvoiceUsecase,
  UpdateInvoiceItemsUsecase,
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  EditManuscriptUsecase,
  CreateManuscriptDTO,
  GetJournalUsecase,
  InvoiceItem,
  Transaction,
  Manuscript,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../../builders';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

function getExistingManuscript(context: Context) {
  return async (submissionId: string): Promise<Manuscript> => {
    const {
      repos: { manuscript: manuscriptRepo },
      services: { logger },
    } = context;

    const existsManuscriptById = new ExistsManuscriptByIdUsecase(
      manuscriptRepo
    );

    const maybeExists = await existsManuscriptById.execute(
      {
        manuscriptId: submissionId,
      },
      defaultContext
    );

    if (maybeExists.isLeft()) {
      logger.error(maybeExists.value.message);
      throw maybeExists.value;
    }

    if (maybeExists.value) {
      const getManuscriptByManuscriptId = new GetManuscriptByManuscriptIdUsecase(
        manuscriptRepo
      );

      const maybeManuscript = await getManuscriptByManuscriptId.execute(
        { manuscriptId: submissionId },
        defaultContext
      );

      if (maybeManuscript.isLeft()) {
        logger.error(maybeManuscript.value.message);
        throw maybeManuscript.value;
      }

      return maybeManuscript.value;
    } else {
      return null;
    }
  };
}

function softDelete(context: Context) {
  return async (submissionId: string): Promise<void> => {
    const {
      repos: { invoiceItem, transaction, manuscript, invoice },
      services: { logger },
    } = context;
    const softDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
      transaction,
      invoiceItem,
      invoice,
      manuscript
    );

    const maybeDelete = await softDeleteDraftTransactionUsecase.execute(
      {
        manuscriptId: submissionId,
      },
      defaultContext
    );

    if (maybeDelete.isLeft()) {
      logger.error(maybeDelete.value.message);
      throw maybeDelete.value;
    }
  };
}

function restore(context: Context) {
  return async (manuscriptId: string): Promise<void> => {
    const {
      repos: { transaction, invoice, invoiceItem, coupon, waiver, manuscript },
      services: { logger },
    } = context;

    const usecase = new RestoreSoftDeleteDraftTransactionUsecase(
      transaction,
      invoiceItem,
      manuscript,
      invoice,
      coupon,
      waiver
    );

    const maybeRestore = await usecase.execute(
      {
        manuscriptId,
      },
      defaultContext
    );

    if (maybeRestore.isLeft()) {
      logger.error(maybeRestore.value.message);
      throw maybeRestore.value;
    }
  };
}

function getInvoiceItems(context: Context) {
  return async (customId: string): Promise<InvoiceItem[]> => {
    const {
      repos: { invoiceItem, manuscript, coupon, waiver },
      services: { logger },
    } = context;
    const invoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      manuscript,
      invoiceItem
    );
    const invoiceItemsUsecase = new GetItemsForInvoiceUsecase(
      invoiceItem,
      coupon,
      waiver
    );
    const maybeInvoiceId = await invoiceIdUsecase.execute(
      {
        customId,
      },
      defaultContext
    );
    if (maybeInvoiceId.isLeft()) {
      logger.error(maybeInvoiceId.value.message);
      throw maybeInvoiceId.value;
    }
    const invoiceId = maybeInvoiceId.value[0];
    logger.info(
      'Get invoice ID by manuscript custom ID',
      invoiceId.id.toString()
    );

    const maybeItems = await invoiceItemsUsecase.execute(
      {
        invoiceId: invoiceId.id.toString(),
      },
      defaultContext
    );
    if (maybeItems.isLeft()) {
      logger.error(maybeItems.value.message);
      throw maybeItems.value;
    }

    return maybeItems.value;
  };
}

function updateInvoicePrice(context: Context) {
  return async (customId: string, newJournalId: string): Promise<void> => {
    const {
      repos: { invoiceItem, catalog },
      services: { logger },
    } = context;
    const getJournalUsecase: GetJournalUsecase = new GetJournalUsecase(catalog);
    const updateInvoiceItemsUsecase: UpdateInvoiceItemsUsecase = new UpdateInvoiceItemsUsecase(
      invoiceItem
    );

    const items = await getInvoiceItems(context)(customId);
    logger.info('Get invoice items for Invoice ID', items);

    const journalResult = await getJournalUsecase.execute(
      {
        journalId: newJournalId,
      },
      defaultContext
    );

    if (journalResult.isLeft()) {
      logger.error(journalResult.value.message);
      throw journalResult.value;
    }

    const journal = journalResult.value;
    logger.info('Get Journal details for new journal ID', journal);

    items.forEach((i) => {
      i.price = journal.amount;
    });

    const maybeUpdatedInvoiceItems = await updateInvoiceItemsUsecase.execute(
      {
        invoiceItems: items,
      },
      defaultContext
    );

    if (maybeUpdatedInvoiceItems.isLeft()) {
      logger.error(maybeUpdatedInvoiceItems.value.message);
      throw maybeUpdatedInvoiceItems.value;
    }

    logger.info('Update invoice items with new journal ID and price', items);
  };
}

function updateManuscript(context: Context) {
  return async (
    oldManuscript: Manuscript,
    data: SubmissionSubmitted
  ): Promise<Manuscript> => {
    const {
      repos: { manuscript: manuscriptRepo },
      services: { logger },
    } = context;
    const editManuscript: EditManuscriptUsecase = new EditManuscriptUsecase(
      manuscriptRepo
    );

    const newManuscript = data.manuscripts[0];

    const author = newManuscript.authors.find((a) => a.isCorresponding);

    const hasSourceJournal = 'sourceJournal' in newManuscript
      && newManuscript['sourceJournal'] !== null
      && newManuscript['sourceJournal']['name'] !== null
      && newManuscript['sourceJournal']['pissn'] !== null
      && newManuscript['sourceJournal']['eissn'] !== null;

    const newJournalId =
      newManuscript.journalId !== oldManuscript.journalId
        ? newManuscript.journalId
        : oldManuscript.journalId;

    const maybeManuscript = await editManuscript.execute(
      {
        articleType: newManuscript.articleType.name,
        preprintValue: newManuscript.preprintValue,
        authorFirstName: author.givenNames,
        manuscriptId: data.submissionId,
        authorCountry: author.country,
        authorSurname: author.surname,
        title: newManuscript.title,
        authorEmail: author.email,
        journalId: newJournalId,
        is_cascaded: hasSourceJournal ? 1 : 0
      },
      defaultContext
    );

    if (maybeManuscript.isLeft()) {
      logger.error(maybeManuscript.value.message);
      throw maybeManuscript.value;
    }

    return maybeManuscript.value;
  };
}

function createTransaction(context: Context) {
  return async (
    authorsEmails: string[],
    manuscriptId: string,
    journalId: string
  ): Promise<Transaction> => {
    const {
      repos: {
        pausedReminder,
        invoiceItem,
        transaction,
        manuscript,
        invoice,
        catalog,
      },
      services: { waiverService, logger },
    } = context;
    const createTransactionUsecase = new CreateTransactionUsecase(
      pausedReminder,
      invoiceItem,
      transaction,
      manuscript,
      catalog,
      invoice,
      waiverService
    );

    const maybeTransaction = await createTransactionUsecase.execute(
      {
        authorsEmails,
        manuscriptId,
        journalId,
      },
      defaultContext
    );

    if (maybeTransaction.isLeft()) {
      logger.error(maybeTransaction.value.message);
      throw maybeTransaction.value;
    }

    return maybeTransaction.value;
  };
}

function createManuscript(context: Context) {
  return async (data: SubmissionSubmitted): Promise<Manuscript> => {
    const {
      repos: { manuscript: manuscriptRepo },
      services: { logger },
    } = context;
    const createManuscript: CreateManuscriptUsecase = new CreateManuscriptUsecase(
      manuscriptRepo
    );

    const manuscript = data.manuscripts[0];
    const hasSourceJournal = 'sourceJournal' in manuscript && manuscript['sourceJournal'] !== null;

    const author = manuscript.authors.find((a) => a.isCorresponding);

    const manuscriptProps: CreateManuscriptDTO = {
      created: new Date(manuscript.submissionCreatedDate),
      articleType: manuscript.articleType.name,
      preprintValue: manuscript.preprintValue,
      authorFirstName: author.givenNames,
      journalId: manuscript.journalId,
      customId: manuscript.customId,
      authorCountry: author.country,
      authorSurname: author.surname,
      authorEmail: author.email,
      title: manuscript.title,
      id: data.submissionId,
      is_cascaded: hasSourceJournal ? 1 : 0
    };

    const maybeManuscript = await createManuscript.execute(
      manuscriptProps,
      defaultContext
    );

    if (maybeManuscript.isLeft()) {
      logger.error(maybeManuscript.value.message);
      throw maybeManuscript.value;
    }

    return maybeManuscript.value;
  };
}

export class SubmissionSubmittedHelpers {
  constructor(private context: Context) {}

  getExistingManuscript = getExistingManuscript(this.context);
  updateInvoicePrice = updateInvoicePrice(this.context);
  createTransaction = createTransaction(this.context);
  createManuscript = createManuscript(this.context);
  updateManuscript = updateManuscript(this.context);
  getInvoiceItems = getInvoiceItems(this.context);
  softDelete = softDelete(this.context);
  restore = restore(this.context);
}
