import { SubmissionWithdrawn } from './SubmissionWithdrawn';

const SUBMISSION_REJECTED = 'SubmissionRejected';

export const SubmissionRejected = {
  event: SUBMISSION_REJECTED,
  handler: SubmissionWithdrawn.handler
};
