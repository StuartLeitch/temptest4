import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import journalsDataView from './JournalsView';

class UniqueJournalsView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW ${this.getViewName()}
AS SELECT DISTINCT ON (j1.event_date) j1.event,
    j1.journal_id,
    j1.journal_issn,
    j1.journal_name,
    j1.is_active,
    j1.jurnal_code,
    j1.journal_email,
    j1.event_date
    FROM ${journalsDataView.getViewName()} j1
  WHERE j1.event_date = (( SELECT max(j2.event_date) AS max
            FROM ${journalsDataView.getViewName()} j2
          WHERE j1.journal_id = j2.journal_id))
  ORDER BY j1.event_date
WITH DATA;
    `;
  }
  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_id)`
  ];
  getViewName(): string {
    return 'unique_journals';
  }
}

const uniqueJournalsView = new UniqueJournalsView();
uniqueJournalsView.addDependency(journalsDataView);

export default uniqueJournalsView;
