import { SubmissionWithdrawn } from './SubmissionWithdrawn';

const SUBMISSION_QUALITY_CHECK_RTCD = 'SubmissionQualityCheckRTCd';

export const SubmissionQualityCheckRTCd = {
  event: SUBMISSION_QUALITY_CHECK_RTCD,
  handler: SubmissionWithdrawn.handler
};
