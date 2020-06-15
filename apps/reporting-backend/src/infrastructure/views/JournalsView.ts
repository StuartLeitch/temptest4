import acceptanceRatesView from './AcceptanceRatesView';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalsDataView from './JournalsDataView';

class JournalsView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT j1.event,
    j1.journal_id,
    j1.journal_issn,
    j1.journal_name,
    COALESCE(publisher.publisher_name, j1.publisher_name, 'Hindawi') as publisher_name,
    j1.is_active,
    j1.journal_code,
    j1.journal_email,
    j1.apc,
    j1.event_date,
    j1.event_id,
    individual_ar.journal_rate as current_journal_acceptance_rate,
    global_ar.journal_rate as current_global_acceptance_rate
  FROM (select *, row_number() over (partition by journal_id order by event_date desc nulls last) as rn from ${journalsDataView.getViewName()} jd) j1
  LEFT JOIN journal_to_publisher publisher on j1.journal_id = publisher.journal_id
  LEFT JOIN (SELECT journal_id, "month", avg(journal_rate) as journal_rate from ${acceptanceRatesView.getViewName()} group by journal_id, "month") individual_ar on individual_ar."month" = to_char(now(), 'YYYY-MM-01')::date and j1.journal_id = individual_ar.journal_id
  LEFT JOIN (SELECT "month", avg(journal_rate) as journal_rate from ${acceptanceRatesView.getViewName()} where journal_rate is not null group by "month") global_ar on global_ar."month" = to_char(now(), 'YYYY-MM-01')::date
  WHERE rn = 1
WITH DATA;
    `;
  }

  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_id)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_id, event_date)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_code)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_name)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (publisher_name)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_issn)`,
  ];

  getViewName(): string {
    return 'journals';
  }
}

const journalsView = new JournalsView();
journalsView.addDependency(journalsDataView);

export default journalsView;
