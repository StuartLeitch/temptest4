import { SubmissionSubmitted, SubmissionEdited, SubmissionRevisionSubmitted } from '@hindawi/phenom-events';

import {
  UpdateManuscriptAuthorUsecase,
  ManuscriptTypeNotInvoiceable,
  UsecaseAuthorizationContext,
  UpdateManuscriptAuthorDTO,
  UpdateTaApprovalUsecase,
  ApplyWaiversUsecase,
  Roles,
  AsyncEither,
  CatalogItem,
  GetJournalUsecase,
  Manuscript,
  RestoreSoftDeleteDraftTransactionUsecase,
  SoftDeleteDraftTransactionUsecase,
  CreateManuscriptDTO,
  CreateTransactionUsecase,
  Transaction,
  CreateManuscriptUsecase,
} from '@hindawi/shared';
import { VError } from 'verror';
import { Context } from '../../../builders';

import { HandlerFunction } from '../../event-handler';

import { extractLatestManuscript, EventHandlerHelpers, hasSourceJournal } from '../helpers';
import { UpdateTaEligibilityUsecase } from '../../../../../../libs/shared/src/lib/modules/manuscripts/usecases/updateTaApproval';

type EventType = SubmissionSubmitted | SubmissionEdited | SubmissionRevisionSubmitted;

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export function submissionEventsHandler<T extends EventType>(eventName: string) {
  return (context: Context): HandlerFunction<T> => {
    const {
      repos: { manuscript: articleRepo, waiver: waiverRepo, invoiceItem: invoiceItemRepo },
      services: { waiverService },
      loggerBuilder,
    } = context;
    const logger = loggerBuilder.getLogger(`PhenomEvent:${eventName}`);
    const applyWaiversUsecase = new ApplyWaiversUsecase(waiverRepo, invoiceItemRepo, waiverService, logger);
    const updateManuscriptAuthor = new UpdateManuscriptAuthorUsecase(articleRepo, logger);

    return async (data: T) => {
      logger.info(`Incoming Event Data`, data);
      const eventHelpers = new EventHandlerHelpers(context);
      const { submissionId } = data;

      const existingManuscript = await eventHelpers.getExistingManuscript(submissionId);
      const latestManuscript = extractLatestManuscript(data);
      const journal = await getJournal(latestManuscript.journalId, context);

      if (manuscriptSwitchedToZeroPriced(journal)) {
        logger.info(
          `Zero priced submission detected for: journalId: '${latestManuscript.journalId}', manuscriptId: '${latestManuscript.id}', manuscriptTitle: '${latestManuscript.title}'`
        );
        if (existingManuscript) {
          await softDelete(data.submissionId, context);
        }
        return;
      }

      if (isSubmissionNotInvoiceable(latestManuscript)) {
        if (existingManuscript) {
          await softDelete(data.submissionId, context);
        }
        return;
      }

      const latestCorrespondingAuthor = findCorrespondingAuthor(latestManuscript);

      if (!existingManuscript) {
        const newManuscript = await createManuscript(data, context);

        logger.info('Manuscript Data', newManuscript);
        const newTransaction = await createTransaction(
          latestManuscript.authors.map((a) => a.email),
          data.submissionId,
          latestManuscript.journalId,
          context
        );
        logger.info(`Transaction Data`, newTransaction);
        return;
      }

      if (manuscriptSwitchedToNotInvoiceable(existingManuscript, latestManuscript)) {
        //if article type changed
        await softDelete(data.submissionId, context);
        return;
      }

      if (manuscriptSwitchedToInvoiceable(existingManuscript, latestManuscript)) {
        await restore(existingManuscript.id.toString(), context);
        //if journal id changed
        if (latestManuscript.journalId !== existingManuscript.journalId) {
          await eventHelpers.updateInvoicePrice(existingManuscript.customId, latestManuscript.journalId);
        }
        await eventHelpers.updateManuscript(existingManuscript, data);
      }

      if (isSameCorrespondingAuthor(existingManuscript.authorEmail, latestCorrespondingAuthor.email)) {
        return;
      }

      const manuscriptDTO = createUpdateManuscriptDTO(latestManuscript, latestCorrespondingAuthor, submissionId);
      const waiverDTO = {
        manuscriptId: submissionId,
        authorsEmails: latestManuscript.authors.map((a) => a.email),
        correspondingAuthorCountry: latestCorrespondingAuthor.country,
        journalId: latestManuscript.journalId,
      };

      const updateTAApproval = new UpdateTaApprovalUsecase(articleRepo);
      const updateTAEligibility = new UpdateTaEligibilityUsecase(articleRepo);
      const result = await new AsyncEither(null)
        .then(async () =>
          updateTAApproval.execute({ manuscript: existingManuscript, isApproved: false }, defaultContext)
        )
        .then(async () =>
          updateTAEligibility.execute({ manuscript: existingManuscript, isEligible: false }, defaultContext)
        )
        .then(async () => updateManuscriptAuthor.execute(manuscriptDTO, defaultContext))
        .then(async () => applyWaiversUsecase.execute(waiverDTO, defaultContext))
        .execute();

      if (result.isLeft()) {
        logger.error(result.value.message, result.value);
        throw new VError(result.value, result.value.message);
      }

      logger.info(`Successfully executed event ${eventName}`);
    };
  };
}

function createUpdateManuscriptDTO(
  latestManuscript,
  latestCorrespondingAuthor,
  submissionId: string
): UpdateManuscriptAuthorDTO {
  return {
    customId: latestManuscript.customId,
    title: latestManuscript.title,
    articleType: latestManuscript.articleType.name,
    correspondingAuthorEmail: latestCorrespondingAuthor.email,
    correspondingAuthorCountry: latestCorrespondingAuthor.country,
    correspondingAuthorSurname: latestCorrespondingAuthor.surname,
    correspondingAuthorFirstName: latestCorrespondingAuthor.givenNames,
    manuscriptId: submissionId,
  };
}

function isSameCorrespondingAuthor(existingAuthorEmail: string, latestAuthorEmail: string) {
  return existingAuthorEmail === latestAuthorEmail;
}

function isSubmissionNotInvoiceable(latestManuscript) {
  return latestManuscript?.articleType?.name in ManuscriptTypeNotInvoiceable;
}

function findCorrespondingAuthor(latestManuscript) {
  return latestManuscript.authors.find((a) => a.isCorresponding);
}

function manuscriptSwitchedToZeroPriced(journal: CatalogItem) {
  return journal.isZeroPriced;
}

function manuscriptSwitchedToNotInvoiceable(existingManuscript: Manuscript, latestManuscript) {
  return existingManuscript && isSubmissionNotInvoiceable(latestManuscript);
}

function isSubmissionInvoiceable(latestManuscript) {
  return !isSubmissionNotInvoiceable(latestManuscript);
}

function manuscriptSwitchedToInvoiceable(existingManuscript: Manuscript, latestManuscript) {
  return existingManuscript && isSubmissionInvoiceable(latestManuscript);
}

async function getJournal(journalId: string, context: Context): Promise<CatalogItem> {
  const {
    repos: { catalog },
    loggerBuilder,
  } = context;

  const logger = loggerBuilder.getLogger('GetJournalUsecase');

  const journalResult = await new GetJournalUsecase(catalog).execute(
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
}

async function softDelete(submissionId: string, context: Context): Promise<void> {
  const {
    repos: { invoiceItem, transaction, manuscript, invoice },
    loggerBuilder,
  } = context;

  const logger = loggerBuilder.getLogger('softDeleteDraftTransactionUsecase');

  const maybeDelete = await new SoftDeleteDraftTransactionUsecase(
    transaction,
    invoiceItem,
    invoice,
    manuscript,
    logger
  ).execute(
    {
      manuscriptId: submissionId,
    },
    defaultContext
  );

  if (maybeDelete.isLeft()) {
    logger.error(maybeDelete.value.message);
    throw maybeDelete.value;
  }
}

async function restore(manuscriptId: string, context: Context): Promise<void> {
  const {
    repos: { transaction, invoice, invoiceItem, coupon, waiver, manuscript },
    loggerBuilder,
  } = context;

  const logger = loggerBuilder.getLogger('RestoreSoftDeleteDraftTransactionUsecase');

  const maybeRestore = await new RestoreSoftDeleteDraftTransactionUsecase(
    transaction,
    invoiceItem,
    manuscript,
    invoice,
    coupon,
    waiver
  ).execute(
    {
      manuscriptId,
    },
    defaultContext
  );

  if (maybeRestore.isLeft()) {
    logger.error(maybeRestore.value.message);
    throw maybeRestore.value;
  }
}

async function createTransaction(
  authorsEmails: string[],
  manuscriptId: string,
  journalId: string,
  context: Context
): Promise<Transaction> {
  const {
    repos: { pausedReminder, invoiceItem, transaction, manuscript, invoice, catalog },
    services: { waiverService },
    loggerBuilder,
  } = context;

  const logger = loggerBuilder.getLogger('CreateTransactionUsecase');

  const maybeTransaction = await new CreateTransactionUsecase(
    pausedReminder,
    invoiceItem,
    transaction,
    manuscript,
    catalog,
    invoice,
    waiverService
  ).execute({ authorsEmails, manuscriptId, journalId }, defaultContext);

  if (maybeTransaction.isLeft()) {
    logger.error(maybeTransaction.value.message);
    throw maybeTransaction.value;
  }

  return maybeTransaction.value;
}

async function createManuscript(data: SubmissionSubmitted, context: Context): Promise<Manuscript> {
  const {
    repos: { manuscript: manuscriptRepo },
    loggerBuilder,
  } = context;

  const logger = loggerBuilder.getLogger('CreateManuscriptUsecase');

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
    is_cascaded: hasSourceJournal(data) ? 1 : 0,
    taEligible: false,
    taFundingApproved: null,
  };

  const maybeManuscript = await new CreateManuscriptUsecase(manuscriptRepo).execute(manuscriptProps, defaultContext);

  if (maybeManuscript.isLeft()) {
    logger.error(maybeManuscript.value.message);
    throw maybeManuscript.value;
  }

  return maybeManuscript.value;
}
