import { SubmissionSubmitted } from '@hindawi/phenom-events';
import { EventHandler } from '../../event-handler';
import { submissionEventsHandler } from './SubmissionEventsHandler';

const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';

export const SubmissionSubmittedHandler: EventHandler<SubmissionSubmitted> = {
  event: SUBMISSION_SUBMITTED,
  handler: submissionEventsHandler<SubmissionSubmitted>(SUBMISSION_SUBMITTED),
};
