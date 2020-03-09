export enum REPORTING_TABLES {
  SUBMISSION = 'submission_events',
  JOURNAL = 'journal_events',
  USER = 'user_events',
  INVOICE = 'invoice_events',
  ARTICLE = 'article_events',
  CHECKER = 'checker_events',
  DEFAULT = 'dump_events'
}

export const CHECKER_TEAM_EVENTS = ['CheckerTeamCreated', 'CheckerTeamUpdated'];

export const CHECKER_SUBMISSION_EVENTS = [
  'ScreenerAssigned',
  'ScreenerReassigned',
  'QualityCheckerAssigned',
  'QualityCheckerReassigned'
];
