import { SubmissionRejected as SubmissionRejectedEvent } from '@hindawi/phenom-events';

import { SubmissionWithdrawn } from './SubmissionWithdrawn';

import { EventHandler } from '../event-handler';

const SUBMISSION_REJECTED = 'SubmissionRejected';

export const SubmissionRejected: EventHandler<SubmissionRejectedEvent> = {
  event: SUBMISSION_REJECTED,
  handler: SubmissionWithdrawn.handler,
};
