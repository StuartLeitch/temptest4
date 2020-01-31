import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class SubmissionDataView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW ${this.getViewName()}
AS SELECT submission_events.type AS submission_event,
    submission_events.payload ->> 'submissionId'::text AS submission_id,
    ((submission_events.payload -> 'manuscripts'::text) -> 0) ->> 'customId'::text AS manuscript_custom_id,
    (((submission_events.payload -> 'manuscripts'::text) -> 0) -> 'articleType'::text) ->> 'name'::text AS article_type,
    (((submission_events.payload -> 'manuscripts'::text) -> 0) ->> 'created'::text)::timestamp without time zone AS submission_date,
    ((submission_events.payload -> 'manuscripts'::text) -> 0) ->> 'journalId'::text AS journal_id,
    ((submission_events.payload -> 'manuscripts'::text) -> 0) ->> 'title'::text AS title,
    ((((submission_events.payload -> 'manuscripts'::text) -> 0) -> 'authors'::text) -> 0) ->> 'country'::text AS submitting_author_country
    FROM ${REPORTING_TABLES.SUBMISSION}
WITH DATA;
    `;
  }
  postCreateQueries = [
    `create index on ${this.getViewName()} (customId)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (journal_id)`
  ];
  getViewName(): string {
    return 'submission_data';
  }
}

const submissionDataView = new SubmissionDataView();

export default submissionDataView;
