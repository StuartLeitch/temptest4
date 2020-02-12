import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import uniqueJournalsView from './UniqueJournals';
import journalSectionsView from './JournalSectionsView';

class JournalSpecialIssuesView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
    CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
    AS SELECT 
      j.journal_id,
      j.journal_issn,
      j.journal_code,
      j.event_date,
      special_issues_view.id as special_issue_id,
      special_issues_view.name as special_issue_name,
      special_issues_view."customId" as special_issue_custom_id,
      null as section_id,
      null as section_name
    FROM 
      ${REPORTING_TABLES.JOURNAL} je 
      join ${uniqueJournalsView.getViewName()} j on je.id = j.event_id,
      lateral jsonb_to_recordset(je.payload -> 'specialIssues') as special_issues_view(id text, name text, created timestamp, updated timestamp, "customId" text)
    UNION ALL
    SELECT 
      j.journal_id,
      j.journal_issn,
      j.journal_code,
      j.event_date,
      special_issues_view.id as special_issue_id,
      special_issues_view.name as special_issue_name,
      special_issues_view."customId" as special_issue_custom_id,
      j.section_id,
      j.section_name
    FROM ${journalSectionsView.getViewName()} j,
    LATERAL jsonb_to_recordset(j.special_issues_json) as special_issues_view(id text, name text, created timestamp, updated timestamp, "customId" text)
        
    `;
  }

  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} (journal_id)`,
    `CREATE INDEX ON ${this.getViewName()} (event_date)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_code)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_issn)`
  ];

  getViewName(): string {
    return 'journal_special_issues';
  }
}

const journalSpecialIssuesView = new JournalSpecialIssuesView();
journalSpecialIssuesView.addDependency(uniqueJournalsView);
journalSpecialIssuesView.addDependency(journalSectionsView);
export default journalSpecialIssuesView;
