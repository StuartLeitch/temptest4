// /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// /* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { SubmissionSubmitted } from '@hindawi/phenom-events';
// * Domain imports
import {
  RestoreSoftDeleteDraftTransactionUsecase,
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetManuscriptByManuscriptIdUsecase,
  SoftDeleteDraftTransactionUsecase,
  ManuscriptTypeNotInvoiceable,
  UsecaseAuthorizationContext,
  GetItemsForInvoiceUsecase,
  UpdateInvoiceItemsUsecase,
  CreateTransactionUsecase,
  CreateManuscriptUsecase,
  EditManuscriptUsecase,
  CreateManuscriptDTO,
  GetJournal,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';

const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

export const SubmissionSubmittedHandler: EventHandler<SubmissionSubmitted> = {
  event: SUBMISSION_SUBMITTED,
  handler(context: Context) {
    return async (data: SubmissionSubmitted): Promise<void> => {
      const {
        repos: {
          pausedReminder: pausedReminderRepo,
          invoiceItem: invoiceItemRepo,
          transaction: transactionRepo,
          manuscript: manuscriptRepo,
          catalog: catalogRepo,
          invoice: invoiceRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
        },
        services: { logger },
      } = context;

      logger.setScope(`PhenomEvent:${SUBMISSION_SUBMITTED}`);
      logger.info(`Incoming Event Data`, data);

      const {
        submissionId,
        manuscripts: [
          {
            preprintValue,
            journalId,
            customId,
            authors,
            title,
            submissionCreatedDate: created,
            articleType: { name },
          },
        ],
      } = data;

      const { email, country, surname, givenNames } = authors.find(
        (a) => a.isCorresponding
      );

      const getManuscriptBySubmissionId: GetManuscriptByManuscriptIdUsecase = new GetManuscriptByManuscriptIdUsecase(
        manuscriptRepo
      );
      const editManuscript: EditManuscriptUsecase = new EditManuscriptUsecase(
        manuscriptRepo
      );
      const softDeleteDraftTransactionUsecase: SoftDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
        transactionRepo,
        invoiceItemRepo,
        invoiceRepo,
        manuscriptRepo
      );
      const getInvoiceIdByManuscriptCustomIdUsecase: GetInvoiceIdByManuscriptCustomIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        manuscriptRepo,
        invoiceItemRepo
      );
      const getItemsForInvoiceUsecase: GetItemsForInvoiceUsecase = new GetItemsForInvoiceUsecase(
        invoiceItemRepo,
        couponRepo,
        waiverRepo
      );
      const getJournalUsecase: GetJournal = new GetJournal(catalogRepo);
      const updateInvoiceItemsUsecase: UpdateInvoiceItemsUsecase = new UpdateInvoiceItemsUsecase(
        invoiceItemRepo
      );
      const restoreDeletedTransactionsUsecase = new RestoreSoftDeleteDraftTransactionUsecase(
        transactionRepo,
        invoiceItemRepo,
        manuscriptRepo,
        invoiceRepo,
        couponRepo,
        waiverRepo
      );

      const alreadyExistingManuscriptResult = await getManuscriptBySubmissionId.execute(
        {
          manuscriptId: submissionId,
        },
        defaultContext
      );

      if (alreadyExistingManuscriptResult.isLeft()) {
        logger.error(
          alreadyExistingManuscriptResult.value.errorValue().message
        );
        throw alreadyExistingManuscriptResult.value.error;
      }

      if (name in ManuscriptTypeNotInvoiceable) {
        await softDeleteDraftTransactionUsecase.execute(
          {
            manuscriptId: submissionId,
          },
          defaultContext
        );
      }

      const alreadyExistingManuscript = alreadyExistingManuscriptResult.value.getValue();

      if (alreadyExistingManuscript) {
        if (name in ManuscriptTypeNotInvoiceable) {
          await softDeleteDraftTransactionUsecase.execute(
            {
              manuscriptId: submissionId,
            },
            defaultContext
          );
        } else {
          await restoreDeletedTransactionsUsecase.execute(
            {
              manuscriptId: submissionId,
            },
            defaultContext
          );
        }

        if (journalId !== alreadyExistingManuscript.journalId) {
          let invoiceId = null;
          const invoiceIdResult = await getInvoiceIdByManuscriptCustomIdUsecase.execute(
            {
              customId: alreadyExistingManuscript.customId,
            },
            defaultContext
          );
          if (invoiceIdResult.isLeft()) {
            logger.error(invoiceIdResult.value.errorValue().message);
            throw invoiceIdResult.value.error;
          } else {
            [invoiceId] = invoiceIdResult.value.getValue();
            logger.info(
              'Get invoice ID by manuscript custom ID',
              invoiceId.id.toString()
            );
          }

          const itemsResult = await getItemsForInvoiceUsecase.execute(
            {
              invoiceId: invoiceId.id.toString(),
            },
            defaultContext
          );
          if (itemsResult.isLeft()) {
            logger.error(itemsResult.value.errorValue().message);
            throw itemsResult.value.error;
          }

          const items = itemsResult.value.getValue();
          logger.info('Get invoice items for Invoice ID', items);

          let journal = null;
          const journalResult = await getJournalUsecase.execute(
            {
              journalId,
            },
            defaultContext
          );

          if (journalResult.isLeft()) {
            logger.error(journalResult.value.errorValue().message);
            throw journalResult.value.error;
          }

          journal = journalResult.value.getValue();
          logger.info('Get Journal details for new journal ID', journal);

          items.forEach((i) => {
            i.price = journal.amount;
          });

          const updatedInvoiceItemsResult = await updateInvoiceItemsUsecase.execute(
            {
              invoiceItems: items,
            },
            defaultContext
          );

          if (updatedInvoiceItemsResult.isLeft()) {
            logger.error(updatedInvoiceItemsResult.value.errorValue().message);
            throw updatedInvoiceItemsResult.value.error;
          }

          logger.info(
            'Update invoice items with new journal ID and price',
            items
          );
        }
        const newJournalId =
          journalId !== alreadyExistingManuscript.journalId
            ? journalId
            : alreadyExistingManuscript.journalId;

        await editManuscript.execute(
          {
            preprintValue,
            title,
            authorFirstName: givenNames,
            manuscriptId: submissionId,
            journalId: newJournalId,
            authorCountry: country,
            authorSurname: surname,
            authorEmail: email,
            articleType: name,
          },
          defaultContext
        );
      } else {
        if (name in ManuscriptTypeNotInvoiceable) {
          return;
        }

        const createTransactionUsecase: CreateTransactionUsecase = new CreateTransactionUsecase(
          transactionRepo,
          invoiceRepo,
          invoiceItemRepo,
          catalogRepo,
          pausedReminderRepo
        );

        const result = await createTransactionUsecase.execute(
          {
            manuscriptId: submissionId,
            journalId,
          },
          defaultContext
        );

        if (result.isLeft()) {
          logger.error(result.value.errorValue().message);
          throw result.value.error;
        } else {
          const newTransaction = result.value.getValue();
          logger.info(`Transaction Data`, newTransaction);

          const manuscriptProps: CreateManuscriptDTO = {
            preprintValue,
            journalId,
            customId,
            title,
            authorFirstName: givenNames,
            created: new Date(created),
            authorCountry: country,
            authorSurname: surname,
            authorEmail: email,
            articleType: name,
            id: submissionId,
          };

          const createManuscript: CreateManuscriptUsecase = new CreateManuscriptUsecase(
            manuscriptRepo
          );

          const createManuscriptResult = await createManuscript.execute(
            manuscriptProps,
            defaultContext
          );

          if (createManuscriptResult.isLeft()) {
            logger.error(createManuscriptResult.value.errorValue().message);
            throw createManuscriptResult.value.error;
          } else {
            const newManuscript = createManuscriptResult.value.getValue();

            logger.info('Manuscript Data', newManuscript);
          }
        }
      }
    };
  },
};
