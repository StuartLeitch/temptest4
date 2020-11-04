import { SubmissionQualityCheckRTCd as SubmissionQualityCheckRTCdEvent } from '@hindawi/phenom-events';

import { SubmissionWithdrawn } from './SubmissionWithdrawn';

import { EventHandler } from '../event-handler';

const SUBMISSION_QUALITY_CHECK_RTCD = 'SubmissionQualityCheckRTCd';

export const SubmissionQualityCheckRTCd: EventHandler<SubmissionQualityCheckRTCdEvent> = {
  event: SUBMISSION_QUALITY_CHECK_RTCD,
  handler: SubmissionWithdrawn.handler,
};
