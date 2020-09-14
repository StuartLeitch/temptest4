export enum REPORTING_TABLES {
  SUBMISSION = 'submission_events',
  JOURNAL = 'journal_events',
  USER = 'user_events',
  INVOICE = 'invoice_events',
  ARTICLE = 'article_events',
  CHECKER = 'checker_events',
  SYNDICATION = 'syndication_events',
  DEFAULT = 'dump_events',
}

export const DELETED_MANUSCRIPTS_TABLE = 'deleted_manuscripts';

export const CHECKER_TEAM_EVENTS = ['CheckerTeamCreated', 'CheckerTeamUpdated'];

export const CHECKER_SUBMISSION_EVENTS = [
  'ScreenerAssigned',
  'ScreenerReassigned',
  'QualityCheckerAssigned',
  'QualityCheckerReassigned',
];

export const SYNDICATION_EVENTS = [
  'IndexerCreated',
  'IndexerUpdated',
  'JournalDatabaseCreated',
  'JournalDatabaseDeleted',
  'JournalDatabaseUpdated',
  'BatchSyndicated',
  'CrossrefTargetProcessed',
  'CrossrefTargetResolved',
];

export const JOURNAL_EVENTS = [
  'JournalAdded',
  'JournalUpdated',
  'JournalActivated',
  'JournalEditorAssigned',
  'JournalEditorRemoved',
  'JournalEditorialAssistantAssigned',
  'JournalSectionAdded',
  'JournalSectionUpdated',
  'JournalSectionEditorAssigned',
  'JournalSectionEditorRemoved',
  'JournalSpecialIssueAdded',
  'JournalSpecialIssueUpdated',
  'JournalSpecialIssueExtended',
  'JournalSpecialIssueEditorAssigned',
  'JournalSpecialIssueEditorRemoved',
  'JournalSpecialIssueOpened',
  'JournalSectionSpecialIssueAdded',
  'JournalSectionSpecialIssueUpdated',
  'JournalSectionSpecialIssueExtended',
  'JournalSectionSpecialIssueEditorAssigned',
  'JournalSectionSpecialIssueEditorRemoved',
  'JournalSectionSpecialIssueOpened',
  'JournalSectionSpecialIssueDeactivated',
  'JournalSpecialIssueDeactivated',
];
