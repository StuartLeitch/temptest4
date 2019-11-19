import { SubmissionWithdrawn } from './SubmissionWithdrawn';

const SUBMISSION_SCREENING_RTCD = 'SubmissionScreeningRTCd';

export const SubmissionScreeningRTCd = {
  event: SUBMISSION_SCREENING_RTCD,
  handler: SubmissionWithdrawn.handler
};
