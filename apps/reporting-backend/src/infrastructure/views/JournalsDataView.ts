import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';

class JournalsDataView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT journal_events.id AS event_id,
    journal_events.type AS event,
    journal_events.payload ->> 'id'::text AS journal_id,
    journal_events.payload ->> 'issn'::text AS journal_issn,
    journal_events.payload ->> 'name'::text AS journal_name,
    (journal_events.payload ->> 'isActive'::text)::boolean AS is_active,
    journal_events.payload ->> 'code'::text AS journal_code,
    journal_events.payload ->> 'email'::text AS journal_email,
    journal_events.payload ->> 'publisherName'::text AS publisher_name,
    coalesce(journal_events.time, cast_to_timestamp(journal_events.payload ->> 'updated'::text), cast_to_timestamp('1980-01-01')) as event_date,
    cast_to_timestamp(journal_events.payload ->> 'updated'::text) AS updated_date
    FROM ${REPORTING_TABLES.JOURNAL}
WITH DATA;
    `;
  }

  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_id)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_id, event_date)`,
    `CREATE INDEX ON ${this.getViewName()} (event_date)`,
    `CREATE INDEX ON ${this.getViewName()} (publisher_name)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (journal_id, journal_issn)`,
  ];

  getViewName(): string {
    return 'journals_data';
  }
}

const journalsDataView = new JournalsDataView();

export default journalsDataView;
