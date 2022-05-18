import { ManuscriptTypeNotInvoiceable } from '@hindawi/shared';
import { SubmissionSubmitted } from '@hindawi/phenom-events';

import { Context } from '../../../builders';

import { EventHandler } from '../../event-handler';

import { SubmissionSubmittedHelpers } from './helpers';
import { EventHandlerHelpers } from '../helpers';

const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';

export const SubmissionSubmittedHandler: EventHandler<SubmissionSubmitted> = {
  event: SUBMISSION_SUBMITTED,
  handler(context: Context) {
    return async (data: SubmissionSubmitted): Promise<void> => {
      const { loggerBuilder } = context;
      const helpers = new SubmissionSubmittedHelpers(context);
      const eventHelpers = new EventHandlerHelpers(context);

      const logger = loggerBuilder.getLogger(
        `PhenomEvent:${SUBMISSION_SUBMITTED}`
      );
      logger.info(`Incoming Event Data`, data);

      const {
        submissionId,
        manuscripts: [
          {
            journalId,
            authors,
            articleType: { name: articleType },
            id,
            title,
          },
        ],
      } = data;

      const manuscript = await eventHelpers.getExistingManuscript(submissionId);
      const journal = await helpers.getJournal(journalId);

      if (journal.isZeroPriced) {
        logger.info(
          `Zero priced submission detected for: journalId: '${journalId}', manuscriptId: '${id}', manuscriptTitle: '${title}'`
        );
        if (manuscript) {
          await helpers.softDelete(submissionId);
        } else {
          //do nothing. Ignore the manuscript if it is submitted to a zero priced journal
        }
      } else {
        if (manuscript) {
          //if article type changed
          if (articleType in ManuscriptTypeNotInvoiceable) {
            await helpers.softDelete(submissionId);
          } else {
            await helpers.restore(manuscript.id.toString());

            //if journal id changed
            if (journalId !== manuscript.journalId) {
              await eventHelpers.updateInvoicePrice(
                manuscript.customId,
                journalId
              );
            }

            await eventHelpers.updateManuscript(manuscript, data);
          }
        } else {
          if (!(articleType in ManuscriptTypeNotInvoiceable)) {
            const newManuscript = await helpers.createManuscript(data);

            logger.info('Manuscript Data', newManuscript);

            const newTransaction = await helpers.createTransaction(
              authors.map((a) => a.email),
              submissionId,
              journalId
            );
            logger.info(`Transaction Data`, newTransaction);
          }
        }
      }
    };
  },
};
