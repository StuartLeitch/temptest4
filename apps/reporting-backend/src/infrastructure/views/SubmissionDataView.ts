import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class SubmissionDataView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT se.id as event_id,
    se.time as event_timestamp,
    se.type AS submission_event,
    se.payload ->> 'submissionId'::text AS submission_id,
    ((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'customId'::text AS manuscript_custom_id,
    (((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) -> 'articleType'::text) ->> 'name'::text AS article_type,
    (((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'created'::text)::timestamp without time zone AS submission_date,
    COALESCE((((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'updated'::text)::timestamp without time zone, se.time) AS updated_date,
    ((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'journalId'::text AS journal_id,
    ((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'title'::text AS title,
    (((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'specialIssueId') as "special_issue_id",
    (((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'sectionId') as "section_id",
    (((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'version') as "version",
    (((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) ->> 'id') as "manuscript_version_id",
    ((((se.payload -> 'manuscripts') -> last_version_index.manuscripts_array_index) -> 'authors'::text) -> 0) ->> 'country'::text AS submitting_author_country,
    last_version_index.manuscripts_array_index as last_version_index
    FROM ${REPORTING_TABLES.SUBMISSION} se
    LEFT JOIN (
      ${'' /*manuscript index of latest version*/}
      SELECT
        t.rn,
        t.manuscripts_array_index - 1  as manuscripts_array_index,
        t.event_id
      from
        (
        SELECT
          sd.event_id,
          sd.version_arr,
          row_number() over(partition by sd.event_id)::int as manuscripts_array_index,
          row_number() over(partition by sd.event_id order by	sd.version_arr desc)::int as rn
        FROM(
          SELECT
            se.id as event_id,
            string_to_array("version", '.')::int[] as version_arr
          FROM
            ${REPORTING_TABLES.SUBMISSION} se,
            jsonb_to_recordset(((se.payload -> 'manuscripts'))) as manuscripts_view("version" text)) sd 
        ) t
        WHERE t.rn = 1
      ) last_version_index on
      se.id = last_version_index.event_id
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (submission_date)`,
    `create index on ${this.getViewName()} (updated_date)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (journal_id)`
  ];

  getViewName(): string {
    return 'submission_data';
  }
}

const submissionDataView = new SubmissionDataView();

export default submissionDataView;
