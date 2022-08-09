import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalEditorialBoardView from './JournalEditorialBoardView';
import journalSpecialIssuesDataView from './JournalSpecialIssuesDataView';

class JournalSpecialIssuesView
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW public.${this.getViewName()}
TABLESPACE pg_default
AS SELECT si_data.journal_id,
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
    concat(lead_guest_editor.given_names, ' ', lead_guest_editor.surname) AS lead_guest_editor_name,
    lead_guest_editor.email AS lead_guest_editor_email,
    lead_guest_editor.aff AS lead_guest_editor_affiliation,
    lead_guest_editor.country AS lead_guest_editor_country,
    editors_counts.editor_count
   FROM ${journalSpecialIssuesDataView.getViewName()} si_data
     LEFT JOIN LATERAL ( SELECT jeb.special_issue_id,
            count(*) AS editor_count
           FROM journal_editorial_board jeb
          WHERE jeb.special_issue_id = si_data.special_issue_id AND jeb.role_type = 'academicEditor'::text
          GROUP BY jeb.special_issue_id) editors_counts ON editors_counts.special_issue_id = si_data.special_issue_id
     LEFT JOIN LATERAL ( SELECT jeb.journal_id,
            jeb.journal_name,
            jeb.section_id,
            jeb.section_name,
            jeb.special_issue_id,
            jeb.special_issue_name,
            jeb.email,
            jeb.given_names,
            jeb.surname,
            jeb.aff,
            jeb.status,
            jeb.role_type,
            jeb.role_label,
            jeb.invited_date,
            jeb.assigned_date,
            jeb.country,
            jeb.is_corresponding,
            jeb.user_id
           FROM ${journalEditorialBoardView.getViewName()} jeb
          WHERE jeb.special_issue_id = si_data.special_issue_id AND jeb.role_type = 'triageEditor'::text
          ORDER BY jeb.invited_date DESC NULLS LAST
         LIMIT 1) lead_guest_editor ON lead_guest_editor.special_issue_id = si_data.special_issue_id
WITH NO DATA;
    `;
  }

  postCreateQueries = [];

  getViewName(): string {
    return 'journal_special_issues';
  }
}

const journalSpecialIssuesView = new JournalSpecialIssuesView();
journalSpecialIssuesView.addDependency(journalSpecialIssuesDataView);
journalSpecialIssuesView.addDependency(journalEditorialBoardView);

export default journalSpecialIssuesView;
