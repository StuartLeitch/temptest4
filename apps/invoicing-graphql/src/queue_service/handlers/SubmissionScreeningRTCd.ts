import { SubmissionWithdrawn as SubmissionWithdrawnEvent } from '@hindawi/phenom-events';

import { SubmissionWithdrawn } from './SubmissionWithdrawn';

import { EventHandler } from '../event-handler';

const SUBMISSION_SCREENING_RTCD = 'SubmissionScreeningRTCd';

export const SubmissionScreeningRTCd: EventHandler<SubmissionWithdrawnEvent> = {
  event: SUBMISSION_SCREENING_RTCD,
  handler: SubmissionWithdrawn.handler,
};
