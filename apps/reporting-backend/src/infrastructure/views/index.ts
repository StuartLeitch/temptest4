import { OrderUtils } from '../../../../../libs/shared/src/lib/utils/Order';
import { AbstractEventView } from './contracts/EventViewContract';
import invoicesDataView from './InvoicesDataView';
import articleDataView from './ArticleDataView';
import authorsView from './AuthorsView';
import checkerSubmissionData from './CheckerSubmissionDataView';
import checkerTeamData from './CheckerTeamDataView';
import checkerToSubmission from './CheckerToSubmissionView';
import checkerToTeamView from './CheckerToTeamView';
import invoicesView from './InvoicesView';
import journalEditorialBoardView from './JournalEditorialBoardView';
import journalsDataView from './JournalsDataView';
import journalSectionsView from './JournalSectionsView';
import journalSpecialIssuesDataView from './JournalSpecialIssuesDataView';
import journalSpecialIssuesView from './JournalSpecialIssuesView';
import journalsView from './JournalsView';
import manuscriptEditors from './ManuscriptEditorsView';
import manuscriptReviewers from './ManuscriptReviewersView';
import manuscriptReviewsView from './ManuscriptReviewsView';
import ManuscriptsUsersView from './ManuscriptUsersView';
import manucriptsView from './ManuscriptsView';
import manuscriptVendorsFullAccessView from './ManuscriptVendorsFullAccessView';
import manuscriptsVendorView from './ManuscriptVendorsView';
import paymentsView from './PaymentsView';
import peerReviewDataView from './PeerReviewDataView';
import submissionDataView from './SubmissionDataView';
import submissionsView from './SubmissionsView';
import usersDataView from './UsersDataView';

export const materializedViewList: AbstractEventView[] = OrderUtils.orderDependencies(
  [
    invoicesDataView,
    usersDataView,
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
    journalSpecialIssuesDataView,
    journalSpecialIssuesView,
    journalEditorialBoardView,
    manucriptsView,
    manuscriptReviewsView,
    manuscriptsVendorView,
    manuscriptVendorsFullAccessView,
    ManuscriptsUsersView,
    peerReviewDataView,
  ]
) as AbstractEventView[];

if (materializedViewList === null) {
  throw Error('Circle dependency found, could not compile views.');
}

export { submissionDataView };
