import {
  SubmissionPeerReviewCycleCheckPassed,
  SubmissionSubmitted,
} from '@hindawi/phenom-events';

import {
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetManuscriptByManuscriptIdUsecase,
  ExistsManuscriptByIdUsecase,
  UsecaseAuthorizationContext,
  GetItemsForInvoiceUsecase,
  UpdateInvoiceItemsUsecase,
  IsInvoiceDeletedUsecase,
  EditManuscriptUsecase,
  GetJournalUsecase,
  VersionCompare,
  InvoiceItem,
  InvoiceId,
  Roles, Manuscript,
} from '@hindawi/shared';

import { Context } from '../../builders';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export function hasSourceJournal(data: SubmissionSubmitted): boolean {
  const manuscript = extractLatestManuscript(data);

  if (!manuscript.sourceJournal) {
    return false;
  }

  const eissn = manuscript.sourceJournal.eissn;
  const pissn = manuscript.sourceJournal.pissn;

  if (!eissn && !pissn) {
    return false;
  }

  if (manuscript.sourceJournal.name == null) {
    return false;
  }

  return true;
}

export function extractLatestManuscript({manuscripts,}: SubmissionSubmitted | SubmissionPeerReviewCycleCheckPassed) {
  const maxVersion = manuscripts.reduce((max, m) => {
    const version = VersionCompare.versionCompare(m.version, max)
      ? m.version
      : max;
    return version;
  }, manuscripts[0].version);

  return manuscripts.find((m) => m.version === maxVersion);
}

function getExistingManuscript(context: Context) {
  return async (submissionId: string): Promise<Manuscript> => {
    const {
      repos: { manuscript: manuscriptRepo },
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger(ExistsManuscriptByIdUsecase.name);

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
      const getManuscriptByManuscriptId =
        new GetManuscriptByManuscriptIdUsecase(manuscriptRepo);

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

function checkIsInvoiceDeleted(context: Context) {
  return async (invoiceId: string): Promise<boolean> => {
    const {
      repos: { invoice: invoiceRepo },
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger(IsInvoiceDeletedUsecase.name);

    const usecase = new IsInvoiceDeletedUsecase(invoiceRepo, logger);
    const maybeDeleted = await usecase.execute({ invoiceId }, defaultContext);

    if (maybeDeleted.isLeft()) {
      logger.error(maybeDeleted.value.message);
      throw maybeDeleted.value;
    }

    const isDeleted = maybeDeleted.value;

    return isDeleted;
  };
}

function getInvoiceId(context: Context) {
  return async (customId: string): Promise<InvoiceId> => {
    const {
      repos: { invoiceItem, manuscript },
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger(
      GetInvoiceIdByManuscriptCustomIdUsecase.name
    );

    const invoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      manuscript,
      invoiceItem
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

    return invoiceId;
  };
}

function getInvoiceItems(context: Context) {
  return async (customId: string): Promise<InvoiceItem[]> => {
    const {
      repos: { invoiceItem, manuscript, coupon, waiver },
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger('getInvoiceItems');

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
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger('updateInvoicePrice');

    const getJournalUsecase: GetJournalUsecase = new GetJournalUsecase(catalog);
    const updateInvoiceItemsUsecase: UpdateInvoiceItemsUsecase =
      new UpdateInvoiceItemsUsecase(invoiceItem);

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
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger('updateManuscript');

    const editManuscript: EditManuscriptUsecase = new EditManuscriptUsecase(
      manuscriptRepo
    );

    const newManuscript = extractLatestManuscript(data);

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
        is_cascaded: hasSourceJournal(data) ? 1 : 0,
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

export class EventHandlerHelpers {
  constructor(private context: Context) {}

  checkIsInvoiceDeleted = checkIsInvoiceDeleted(this.context);
  getExistingManuscript = getExistingManuscript(this.context);
  updateInvoicePrice = updateInvoicePrice(this.context);
  updateManuscript = updateManuscript(this.context);
  getInvoiceItems = getInvoiceItems(this.context);
  getInvoiceId = getInvoiceId(this.context);
}
