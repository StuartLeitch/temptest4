import { SubmissionSubmitted } from '@hindawi/phenom-events';

import {
  RestoreSoftDeleteDraftTransactionUsecase,
  SoftDeleteDraftTransactionUsecase,
  UsecaseAuthorizationContext,
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  CreateManuscriptDTO,
  GetJournalUsecase,
  CatalogItem,
  Transaction,
  Manuscript,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../../builders';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

function softDelete(context: Context) {
  return async (submissionId: string): Promise<void> => {
    const {
      repos: { invoiceItem, transaction, manuscript, invoice },
      services: { logger },
    } = context;
    const softDeleteDraftTransactionUsecase =
      new SoftDeleteDraftTransactionUsecase(
        transaction,
        invoiceItem,
        invoice,
        manuscript,
        logger
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

function getJournal(context: Context) {
  return async (journalId: string): Promise<CatalogItem> => {
    const {
      repos: { catalog },
      services: { logger },
    } = context;
    const getJournalUsecase: GetJournalUsecase = new GetJournalUsecase(catalog);

    const journalResult = await getJournalUsecase.execute(
      {
        journalId: journalId,
      },
      defaultContext
    );

    if (journalResult.isLeft()) {
      logger.error(journalResult.value.message);
      throw journalResult.value;
    }

    const journal = journalResult.value;
    logger.info('Get Journal details for new journal ID', journal);
    return journal;
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
    const createManuscript: CreateManuscriptUsecase =
      new CreateManuscriptUsecase(manuscriptRepo);

    const manuscript = data.manuscripts[0];
    let hasSourceJournal = false;
    if (
      'sourceJournal' in manuscript &&
      manuscript['sourceJournal']['name'] !== null &&
      manuscript['sourceJournal']['pissn'] !== null &&
      manuscript['sourceJournal']['eissn'] !== null
    ) {
      hasSourceJournal = true;
    }

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
      is_cascaded: hasSourceJournal ? 1 : 0,
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

  createTransaction = createTransaction(this.context);
  createManuscript = createManuscript(this.context);
  getJournal = getJournal(this.context);
  softDelete = softDelete(this.context);
  restore = restore(this.context);
}
