import { SubmissionRevisionSubmitted } from '@hindawi/phenom-events';
import { EventHandler } from '../../event-handler';
import { submissionEventsHandler } from './SubmissionEventsHandler';

const SUBMISSION_REVISION_SUBMITTED = 'SubmissionRevisionSubmitted';

export const SubmissionRevisionSubmittedHandler: EventHandler<SubmissionRevisionSubmitted> = {
  event: SUBMISSION_REVISION_SUBMITTED,
  handler: submissionEventsHandler<SubmissionRevisionSubmitted>(SUBMISSION_REVISION_SUBMITTED),
};
