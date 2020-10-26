import { SubmissionSubmitted } from '@hindawi/phenom-events';
// * Domain imports
import {
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetManuscriptByManuscriptIdUsecase,
  SoftDeleteDraftTransactionUsecase,
  UsecaseAuthorizationContext,
  GetItemsForInvoiceUsecase,
  UpdateInvoiceItemsUsecase,
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  EditManuscriptUsecase,
  CreateManuscriptDTO,
  InvoiceItem,
  Transaction,
  GetJournal,
  Manuscript,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../../builders';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

function getExistingManuscript(context: Context) {
  return async (submissionId: string): Promise<Manuscript> => {
    const {
      repos: { manuscript: manuscriptRepo },
      services: { logger },
    } = context;

    const getManuscriptBySubmissionId = new GetManuscriptByManuscriptIdUsecase(
      manuscriptRepo
    );

    const maybeManuscript = await getManuscriptBySubmissionId.execute(
      {
        manuscriptId: submissionId,
      },
      defaultContext
    );

    if (maybeManuscript.isLeft()) {
      logger.error(maybeManuscript.value.errorValue().message);
      throw maybeManuscript.value.error;
    }

    return maybeManuscript.value.getValue();
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
      logger.error(maybeDelete.value.errorValue().message);
      throw maybeDelete.value.error;
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
      logger.error(maybeInvoiceId.value.errorValue().message);
      throw maybeInvoiceId.value.error;
    }
    const invoiceId = maybeInvoiceId.value.getValue()[0];
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
      logger.error(maybeItems.value.errorValue().message);
      throw maybeItems.value.error;
    }

    return maybeItems.value.getValue();
  };
}

function updateInvoicePrice(context: Context) {
  return async (customId: string, newJournalId: string): Promise<void> => {
    const {
      repos: { invoiceItem, catalog },
      services: { logger },
    } = context;
    const getJournalUsecase: GetJournal = new GetJournal(catalog);
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
      logger.error(journalResult.value.errorValue().message);
      throw journalResult.value.error;
    }

    const journal = journalResult.value.getValue();
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
      logger.error(maybeUpdatedInvoiceItems.value.errorValue().message);
      throw maybeUpdatedInvoiceItems.value.error;
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
      },
      defaultContext
    );

    if (maybeManuscript.isLeft()) {
      logger.error(maybeManuscript.value.errorValue().message);
      throw maybeManuscript.value.error;
    }

    return maybeManuscript.value.getValue();
  };
}

function createTransaction(context: Context) {
  return async (
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
    };

    const maybeManuscript = await createManuscript.execute(
      manuscriptProps,
      defaultContext
    );

    if (maybeManuscript.isLeft()) {
      logger.error(maybeManuscript.value.errorValue().message);
      throw maybeManuscript.value.error;
    }

    return maybeManuscript.value.getValue();
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
}
