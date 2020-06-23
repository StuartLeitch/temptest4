import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import uniqueJournalsView from './JournalsView';
import journalSectionsView from './JournalSectionsView';

class JournalSpecialIssuesDataView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
    CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
    AS SELECT 
      j.journal_id,
      journal_name,
      j.journal_issn,
      j.journal_code,
      j.event_date,
      ${this.getSpecialViewSelectFields()}
      null as section_id,
      null as section_name,
      special_issues_view.editors as editors_json
    FROM 
      ${REPORTING_TABLES.JOURNAL} je 
      join ${uniqueJournalsView.getViewName()} j on je.id = j.event_id,
      lateral jsonb_to_recordset(je.payload -> 'specialIssues') as special_issues_view(${this.getSpecialViewFields()})
    UNION ALL
    SELECT 
      j.journal_id,
      journal_name,
      j.journal_issn,
      j.journal_code,
      j.event_date,
      ${this.getSpecialViewSelectFields()}
      j.section_id,
      j.section_name,
      special_issues_view.editors as editors_json
    FROM ${journalSectionsView.getViewName()} j,
    LATERAL jsonb_to_recordset(j.special_issues_json) as special_issues_view(${this.getSpecialViewFields()})
  WITH DATA
    `;
  }

  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} (journal_id)`,
    `CREATE INDEX ON ${this.getViewName()} (special_issue_id)`,
    `CREATE INDEX ON ${this.getViewName()} (special_issue_name)`,
    `CREATE INDEX ON ${this.getViewName()} (special_issue_custom_id)`,
    `CREATE INDEX ON ${this.getViewName()} (event_date)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_code)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_name)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_issn)`,
  ];

  getViewName(): string {
    return 'journal_special_issues_data';
  }

  getSpecialViewSelectFields(): string {
    return `special_issues_view.id as special_issue_id,
    special_issues_view.name as special_issue_name,
    special_issues_view."customId" as special_issue_custom_id,
    cast_to_timestamp(special_issues_view."endDate") as closed_date,
    cast_to_timestamp(special_issues_view."startDate") as open_date,
    case
      when special_issues_view."isActive" = true then 'open'
      when special_issues_view."isCancelled" = true then 'cancelled'
      else 'closed'
    end as status,
    `;
  }

  getSpecialViewFields(): string {
    return 'id text, name text, "isActive" bool, "isCancelled" bool, "endDate" text, "startDate" text, "cancelReason" text, created text, updated text, "customId" text, editors jsonb';
  }
}

const journalSpecialIssuesDataView = new JournalSpecialIssuesDataView();
journalSpecialIssuesDataView.addDependency(uniqueJournalsView);
journalSpecialIssuesDataView.addDependency(journalSectionsView);

export default journalSpecialIssuesDataView;
