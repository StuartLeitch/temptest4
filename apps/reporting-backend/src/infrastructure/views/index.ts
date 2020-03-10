import Knex from 'knex';

import { OrderUtils } from '../../../../../libs/shared/src/lib/utils/Order';
import { Logger } from '../../lib/logger';
import { differenceInSeconds } from '../../utils/utils';

import { AbstractEventView } from './contracts/EventViewContract';

import authorsView from './AuthorsView';
import articleDataView from './ArticleDataView';
import invoicesDataView from './InvoicesDataView';
import checkerSubmissionData from './CheckerSubmissionDataView';
import checkerTeamData from './CheckerTeamDataView';
import checkerToTeamView from './CheckerToTeamView';
import checkerToSubmission from './CheckerToSubmissionView';
import invoicesView from './InvoicesView';
import journalSectionsView from './JournalSectionsView';
import journalSpecialIssuesView from './JournalSpecialIssues';
import journalsDataView from './JournalsDataView';
import manuscriptEditors from './ManuscriptEditorsView';
import manuscriptReviewers from './ManuscriptReviewersView';
import manuscriptReviewsView from './ManuscriptReviewsView';
import manucriptsView from './ManuscriptsView';
import submissionDataView from './SubmissionDataView';
import submissionsView from './SubmissionsView';
import journalsView from './JournalsView';

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

export { submissionDataView };
