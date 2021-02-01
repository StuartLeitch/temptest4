import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import uniqueJournalsView from './JournalsView';

class JournalSectionsView
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT 
  uj.journal_id,
  uj.journal_name,
  uj.journal_issn,
  uj.journal_code,
  uj.event_date,
  section_view.id as "section_id",
  section_view.name as "section_name",
  section_view.created as "created_date",
  section_view.updated as "updated_date",
  section_view."specialIssues" as special_issues_json,
  section_view."editors" as editors_json
FROM 
  ${REPORTING_TABLES.JOURNAL} je 
  JOIN ${uniqueJournalsView.getViewName()} uj on je.id = uj.event_id,
  LATERAL jsonb_to_recordset(je.payload -> 'sections') as section_view(id text, name text, created timestamp, updated timestamp, "specialIssues" jsonb, editors jsonb)
WITH NO DATA;
    `;
  }

  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} (journal_id)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_name)`,
    `CREATE INDEX ON ${this.getViewName()} (event_date)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_code)`,
    `CREATE INDEX ON ${this.getViewName()} (journal_issn)`,
  ];

  getViewName(): string {
    return 'journal_sections';
  }
}

const journalSectionsView = new JournalSectionsView();
journalSectionsView.addDependency(uniqueJournalsView);

export default journalSectionsView;
