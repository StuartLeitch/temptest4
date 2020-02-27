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
  last_sd.submission_event as last_event_type,
  last_sd.event_timestamp as last_event_date,
  sd.event_timestamp as final_decision_date,
  sd.submission_event as final_decision_type,
  case when sd.submission_event = 'SubmissionQualityCheckPassed' then sd.event_timestamp else null end as accepted_date,
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
  concat(e.given_names, ' ', e.surname) as triage_editor, e.email as triage_editor_email, e.country as triage_editor_country, e.aff as triage_editor_affiliation,
  concat(e2.given_names, ' ', e2.surname) as handling_editor, e2.email as handling_editor_email, e2.country as handling_editor_country, e2.aff as handling_editor_affiliation,
  concat(e3.given_names, ' ', e3.surname) as editorial_assistant, e3.email as editorial_assistant_email, e3.country as editorial_assistant_country, e3.aff as editorial_assistant_affiliation
FROM ${submissionView.getViewName()} s 
  LEFT JOIN LATERAL (SELECT * FROM ${authorsView.getViewName()} a where a.manuscript_custom_id = s.manuscript_custom_id and a.is_corresponding = true limit 1) a on a.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${authorsView.getViewName()} a where a.manuscript_custom_id = s.manuscript_custom_id and a.is_submitting = true limit 1) a2 on a.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView.getViewName()} e where e.manuscript_custom_id = s.manuscript_custom_id and e.role_type = 'triageEditor' limit 1) e on e.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView.getViewName()} e2 where e2.manuscript_custom_id = s.manuscript_custom_id and e2.role_type = 'academicEditor' limit 1) e2 on e2.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView.getViewName()} e3 where e3.manuscript_custom_id = s.manuscript_custom_id and e3.role_type = 'editorialAssistant' limit 1) e3 on e3.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${journalSectionsView.getViewName()} js where js.section_id = s.section_id limit 1) sec on sec.section_id = s.section_id
  LEFT JOIN LATERAL (SELECT * FROM ${journalSpecialIssuesView.getViewName()} jsi where jsi.special_issue_id = s.special_issue_id limit 1) spec on spec.special_issue_id = s.special_issue_id
  LEFT JOIN LATERAL (SELECT * FROM ${invoicesView.getViewName()} i where i.manuscript_custom_id = s.manuscript_custom_id limit 1) i on i.manuscript_custom_id = s.manuscript_custom_id
  LEFT JOIN LATERAL (SELECT * FROM ${submissionDataView.getViewName()} sd where sd.submission_id = s.submission_id and sd.submission_event in ('SubmissionQualityCheckPassed', 'SubmissionWithdrawn', 'SubmissionScreeningRTCd', 'SubmissionQualityCheckRTCd', 'SubmissionRejected') 
    order by updated_date desc limit 1) sd on sd.submission_id = s.submission_id
  LEFT JOIN LATERAL (SELECT * FROM ${submissionDataView.getViewName()} sd where sd.submission_id = s.submission_id order by event_timestamp desc limit 1) last_sd on last_sd.submission_id = s.submission_id
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (submission_date)`,
    `create index on ${this.getViewName()} (updated_date)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (triage_editor_email)`,
    `create index on ${this.getViewName()} (handling_editor_email)`,
    `create index on ${this.getViewName()} (editorial_assistant_email)`,
    `create index on ${this.getViewName()} (version)`,
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
manuscriptsView.addDependency(submissionView);

export default manuscriptsView;
