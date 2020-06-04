import Knex from 'knex';

import { OrderUtils } from '../../../../../libs/shared/src/lib/utils/Order';
import { Logger } from '../../lib/logger';
import { differenceInSeconds } from '../../utils/utils';

import articleDataView from './ArticleDataView';
import authorsView from './AuthorsView';
import checkerSubmissionData from './CheckerSubmissionDataView';
import checkerTeamData from './CheckerTeamDataView';
import checkerToSubmission from './CheckerToSubmissionView';
import checkerToTeamView from './CheckerToTeamView';
import { AbstractEventView } from './contracts/EventViewContract';
import invoicesDataView from './InvoicesDataView';
import invoicesView from './InvoicesView';
import journalEditorialBoardView from './JournalEditorialBoardView';
import journalsDataView from './JournalsDataView';
import journalSectionsView from './JournalSectionsView';
import journalSpecialIssuesView from './JournalSpecialIssuesView';
import journalsView from './JournalsView';
import manuscriptEditors from './ManuscriptEditorsView';
import manuscriptReviewers from './ManuscriptReviewersView';
import manuscriptReviewsView from './ManuscriptReviewsView';
import manucriptsView from './ManuscriptsView';
import manuscriptsVendorView from './ManuscriptVendorsView';
import paymentsView from './PaymentsView';
import submissionDataView from './SubmissionDataView';
import submissionsView from './SubmissionsView';

const logger = new Logger('materializedView');

export const materializedViewList: AbstractEventView[] = OrderUtils.orderDependencies(
  [
    invoicesDataView,
    articleDataView,
    checkerSubmissionData,
    checkerToSubmission,
    checkerTeamData,
    checkerToTeamView,
    // submissionDataView, -> is a table, updated by triggers
    submissionsView,
    journalsDataView,
    journalsView,
    authorsView,
    paymentsView,
    invoicesView,
    manuscriptEditors,
    manuscriptReviewers,
    journalSectionsView,
    journalSpecialIssuesView,
    journalEditorialBoardView,
    manucriptsView,
    manuscriptReviewsView,
    manuscriptsVendorView,
  ]
) as AbstractEventView[];

if (materializedViewList === null) {
  throw Error('Circle dependency found, could not compile views.');
}

export async function refreshViews(knex: Knex) {
  const refreshStart = new Date();
  for (const view of materializedViewList) {
    const refreshQuery = view.getRefreshQuery();
    if (!refreshQuery) {
      logger.info('Skipping ' + view.getViewName());
      continue;
    }
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

export { submissionDataView };
