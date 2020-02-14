import Knex from 'knex';

import { OrderUtils } from '../../../../../libs/shared/src/lib/utils/Order';
import { Logger } from '../../lib/logger';
import { differenceInSeconds } from '../../utils/utils';

import { AbstractEventView } from './contracts/EventViewContract';

import authorsView from './AuthorsView';
import invoicesDataView from './InvoicesDataView';
import invoicesView from './InvoicesView';
import journalSectionsView from './JournalSectionsView';
import journalSpecialIssuesView from './JournalSpecialIssues';
import journalsView from './JournalsView';
import manuscriptEditors from './ManuscriptEditorsView';
import manuscriptReviewers from './ManuscriptReviewersView';
import manuscriptReviewsView from './ManuscriptReviewsView';
import manucriptsView from './ManuscriptsView';
import submissionDataView from './SubmissionDataView';
import submissionsView from './SubmissionsView';
import uniqueJournals from './UniqueJournals';

const logger = new Logger('materializedView');

export const materializedViewList: AbstractEventView[] = OrderUtils.orderDependencies(
  [
    invoicesDataView,
    journalsView,
    submissionDataView,
    submissionsView,
    uniqueJournals,
    authorsView,
    invoicesView,
    manuscriptEditors,
    manuscriptReviewers,
    journalSectionsView,
    journalSpecialIssuesView,
    manucriptsView,
    manuscriptReviewsView
  ]
) as AbstractEventView[];

if (materializedViewList === null) {
  throw Error('Circle dependency found, could not compile views.');
}

export async function refreshViews(knex: Knex) {
  const refreshStart = new Date();
  for (const view of materializedViewList) {
    const refreshQuery = view.getRefreshQuery();
    const queryStart = new Date();
    try {
      await knex.raw(refreshQuery);
      logger.info(
        `${refreshQuery} took ${differenceInSeconds(queryStart)} seconds`
      );
    } catch (error) {
      logger.error(error);
    }
  }
  logger.info(
    `Refreshing views took ${differenceInSeconds(refreshStart)} seconds`
  );
}
