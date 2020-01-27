import { EventDTO } from 'libs/shared/src/lib/modules/reporting/domain/EventDTO';

const events = [
  'JournalAdded',
  'JournalEditorAssigned',
  'SubmissionSubmitted',
  'ManuscriptIngested',
  'SanctionListCheckDone',
  'AuthorProfilesSearchFinished',
  'FileConverted',
  'LanguageChecked',
  'SuspiciousWordsProcessingDone',
  'SimilarityCheckFinished',
  'AutomaticChecksDone',
  'JournalSpecialIssueAdded',
  'JournalSpecialIssueEditorAssigned',
  'JournalSectionAdded',
  'JournalSectionSpecialIssueAdded',
  'JournalSectionEditorAssigned',
  'JournalSectionSpecialIssueEditorAssigned',
  'UserAdded',
  'WosNewDataPublished',
  'UserUpdated',
  'SubmissionScreeningRTCd',
  'SubmissionRejected',
  'SubmissionAccepted',
  'SubmissionQualityCheckPassed',
  'SubmissionPackageCreated',
  'SubmissionWithdrawn',
  'JournalUpdated',
  'UserORCIDAdded',
  'UserActivated',
  'InvoiceCreated',
  'InvoiceConfirmed',
  'JournalSectionSpecialIssueOpened',
  'JournalSpecialIssueOpened',
  'AuthorConfirmed',
  'SubmissionScreeningReturnedToDraft',
  'SubmissionScreeningPassed',
  'SubmissionQualityCheckFilesRequested',
  'HealthCheckResponse',
  'HealthCheck'
];

export function parseEvent(event: any): EventDTO {
  const { MessageId, Body } = event;
  let parsedEvent = null;
  try {
    parsedEvent = JSON.parse(JSON.parse(Body).Message);
    if (MessageId.length === 0) {
      throw new Error('invalid event id on message ' + JSON.stringify(event));
    }
    if (typeof parsedEvent.event !== 'string') {
      throw new Error('invalid event name on message ' + MessageId);
    }
    if (typeof parsedEvent.data !== 'object') {
      throw new Error('invalid payload on message ' + MessageId);
    }
    parsedEvent = {
      id: MessageId,
      event: parsedEvent.event.split(':').pop(),
      data: parsedEvent.data
    };
  } catch (error) {
    console.error(error.message);
  }
  return parsedEvent;
}
