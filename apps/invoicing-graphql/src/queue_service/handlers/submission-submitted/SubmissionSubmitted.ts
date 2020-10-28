// /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// /* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { ManuscriptTypeNotInvoiceable } from '@hindawi/shared';
import { SubmissionSubmitted } from '@hindawi/phenom-events';

import { Context } from '../../../builders';

import { EventHandler } from '../../event-handler';

import { SubmissionSubmittedHelpers } from './helpers';

const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';

export const SubmissionSubmittedHandler: EventHandler<SubmissionSubmitted> = {
  event: SUBMISSION_SUBMITTED,
  handler(context: Context) {
    return async (data: SubmissionSubmitted): Promise<void> => {
      const {
        services: { logger },
      } = context;
      const helpers = new SubmissionSubmittedHelpers(context);

      logger.setScope(`PhenomEvent:${SUBMISSION_SUBMITTED}`);
      logger.info(`Incoming Event Data`, data);

      const {
        submissionId,
        manuscripts: [
          {
            journalId,
            articleType: { name: articleType },
          },
        ],
      } = data;

      const manuscript = await helpers.getExistingManuscript(submissionId);

      if (manuscript) {
        if (articleType in ManuscriptTypeNotInvoiceable) {
          await helpers.softDelete(submissionId);
          return;
        } else {
          await helpers.restore(manuscript.id.toString());
        }

        if (journalId !== manuscript.journalId) {
          await helpers.updateInvoicePrice(manuscript.customId, journalId);
        }

        await helpers.updateManuscript(manuscript, data);
      } else {
        if (articleType in ManuscriptTypeNotInvoiceable) {
          return;
        }

        const newManuscript = await helpers.createManuscript(data);

        logger.info('Manuscript Data', newManuscript);

        const newTransaction = await helpers.createTransaction(
          submissionId,
          journalId
        );
        logger.info(`Transaction Data`, newTransaction);
      }
    };
  },
};
