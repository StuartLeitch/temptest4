import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalEditorialBoardView from './JournalEditorialBoardView';
import journalSpecialIssuesDataView from './JournalSpecialIssuesDataView';

class JournalSpecialIssuesView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()} AS
  SELECT 
  si_data.journal_id,
  si_data.journal_name,
  si_data.journal_issn,
  si_data.journal_code,
  si_data.event_date,
  si_data.special_issue_id,
  si_data.special_issue_name,
  si_data.special_issue_custom_id,
  si_data.closed_date,
  si_data.open_date,
  si_data.status,
  si_data.section_id,
  si_data.section_name,
  concat(lead_guest_editor.given_names, ' ', lead_guest_editor.surname) as lead_guest_editor_name,
  lead_guest_editor.email as lead_guest_editor_email,
  lead_guest_editor.aff as lead_guest_editor_affiliation,
  lead_guest_editor.country as lead_guest_editor_country,
  editors_counts.editor_count
  FROM ${journalSpecialIssuesDataView.getViewName()} si_data
  LEFT JOIN LATERAL (
    SELECT 
      special_issue_id,
      count(*) as editor_count
    FROM ${journalEditorialBoardView.getViewName()} jeb
      WHERE jeb.special_issue_id = si_data.special_issue_id
        AND role_type = 'academicEditor'
    GROUP BY special_issue_id
  ) editors_counts on editors_counts.special_issue_id = si_data.special_issue_id
  LEFT JOIN LATERAL (
    SELECT *    
    FROM ${journalEditorialBoardView.getViewName()} jeb
      WHERE jeb.special_issue_id = si_data.special_issue_id
        AND role_type = 'triageEditor'
    ORDER BY accepted_date desc nulls last, invited_date desc nulls last
    LIMIT 1
  ) lead_guest_editor on lead_guest_editor.special_issue_id = si_data.special_issue_id
WITH DATA
    `;
  }

  postCreateQueries = [...journalSpecialIssuesDataView.postCreateQueries];

  getViewName(): string {
    return 'journal_special_issues';
  }
}

const journalSpecialIssuesView = new JournalSpecialIssuesView();
journalSpecialIssuesView.addDependency(journalSpecialIssuesDataView);
journalSpecialIssuesView.addDependency(journalEditorialBoardView);

export default journalSpecialIssuesView;
