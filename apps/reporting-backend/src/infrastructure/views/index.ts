import { OrderUtils } from '../../../../../libs/shared/src/lib/utils/OrderUtils';

import { AbstractEventView } from './contracts/EventViewContract';

import invoicesDataView from './InvoicesDataView';
import journalsView from './JournalsView';
import submissionDataView from './SubmissionDataView';
import submissionsView from './SubmissionsView';
import uniqueJournals from './UniqueJournals';

export const materializedViewList: AbstractEventView[] = [
  invoicesDataView,
  journalsView,
  submissionDataView,
  submissionsView,
  uniqueJournals
];

console.log(
  OrderUtils.orderDependencies(materializedViewList).map((v: any) =>
    v.getViewName()
  )
);
