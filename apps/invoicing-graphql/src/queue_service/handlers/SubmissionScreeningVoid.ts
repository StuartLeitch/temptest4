import { SubmissionScreeningVoid as SubmissionScreeningVoidEvent } from '@hindawi/phenom-events';

import { SubmissionWithdrawn } from './SubmissionWithdrawn';

import { EventHandler } from '../event-handler';

const SUBMISSION_SCREENING_VOID = 'SubmissionScreeningVoid';

export const SubmissionScreeningVoid: EventHandler<SubmissionScreeningVoidEvent> = {
  event: SUBMISSION_SCREENING_VOID,
  handler: SubmissionWithdrawn.handler,
};
