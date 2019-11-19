import { SubmissionWithdrawn } from './SubmissionWithdrawn';

const SUBMISSION_PEER_REVIEW_REJECTED = 'SubmissionPeerReviewRejected';

export const SubmissionPeerReviewRejected = {
  event: SUBMISSION_PEER_REVIEW_REJECTED,
  handler: SubmissionWithdrawn.handler
};
