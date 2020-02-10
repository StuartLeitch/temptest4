import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';

import authorsView from './AuthorsView';
import invoicesView from './InvoicesView';
import journalSectionsView from './JournalSectionsView';
import journalSpecialIssuesView from './JournalSpecialIssues';
import manuscriptEditorsView from './ManuscriptEditorsView';
import submissionDataView from './SubmissionDataView';
import submissionView from './SubmissionsView';

class ManuscriptsView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT 
  s.*,
  sd.updated_date as accepted_date,
  i.apc,
  CASE
    WHEN s.special_issue_id is NULL THEN 'special'::text
    ELSE 'regular'::text
  END AS issue_type,
  spec.special_issue_name as "special_issue",
  spec.special_issue_custom_id as "special_issue_custom_id",
  sec.section_name as "section",		
  concat(a.given_names, ' ', a.surname) as corresponding_author, a.email as corresponding_author_email, a.country as corresponding_author_country, a.aff as corresponding_author_affiliation,  
  concat(a2.given_names, ' ', a2.surname) as submitting_author, a2.email as submitting_author_email, a2.country as submitting_author_country, a2.aff as submitting_author_affiliation,
  concat(e.given_names, ' ', e.surname) as chief_editor, e.email as chief_editor_email, e.country as chief_editor_country, e.aff as chief_editor_affiliation
FROM ${submissionView.getViewName()} s 
  LEFT JOIN LATERAL (SELECT * FROM ${authorsView.getViewName()} a where a.manuscript_custom_id = s.manuscript_custom_id and a.is_corresponding = true limit 1) a on a.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${authorsView.getViewName()} a where a.manuscript_custom_id = s.manuscript_custom_id and a.is_submitting = true limit 1) a2 on a.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView.getViewName()} e where e.manuscript_custom_id = s.manuscript_custom_id and e.role_type = 'triageEditor') e on e.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${journalSectionsView.getViewName()} js where js.section_id = s.section_id limit 1) sec on sec.section_id = s.section_id
  LEFT JOIN LATERAL (SELECT * FROM ${journalSpecialIssuesView.getViewName()} jsi where jsi.special_issue_id = s.special_issue_id limit 1) spec on spec.special_issue_id = s.special_issue_id
  LEFT JOIN LATERAL (SELECT * FROM ${invoicesView.getViewName()} i where i.manuscript_custom_id = s.manuscript_custom_id limit 1) i on i.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${submissionDataView.getViewName()} sd where sd.submission_id = s.submission_id and sd.submission_event = 'SubmissionQualityCheckPassed' order by updated_date desc limit 1) sd on sd.submission_id = s.submission_id
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (submission_date)`,
    `create index on ${this.getViewName()} (updated_date)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (journal_id)`
  ];

  getViewName(): string {
    return 'manuscripts';
  }
}

const manuscriptsView = new ManuscriptsView();

manuscriptsView.addDependency(authorsView);
manuscriptsView.addDependency(invoicesView);
manuscriptsView.addDependency(journalSectionsView);
manuscriptsView.addDependency(journalSpecialIssuesView);
manuscriptsView.addDependency(manuscriptEditorsView);
manuscriptsView.addDependency(submissionDataView);
manuscriptsView.addDependency(submissionView);

export default manuscriptsView;
