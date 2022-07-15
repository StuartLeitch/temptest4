import { SubmissionEdited } from '@hindawi/phenom-events';
import { EventHandler } from '../../event-handler';
import { submissionEventsHandler } from './SubmissionEventsHandler';

const SUBMISSION_EDITED = 'SubmissionEdited';

export const SubmissionEditedHandler: EventHandler<SubmissionEdited> = {
  event: SUBMISSION_EDITED,
  handler: submissionEventsHandler<SubmissionEdited>(SUBMISSION_EDITED),
};
