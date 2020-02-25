import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

// move version array to separate table
class SubmissionDataView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE TABLE ${this.getViewName()} (
  event_id uuid NULL,
  event_timestamp timestamptz NULL,
  submission_event varchar(255) NULL,
  submission_id text NULL,
  manuscript_custom_id text NULL,
  article_type text NULL,
  submission_date timestamp NULL,
  updated_date timestamptz NULL,
  journal_id text NULL,
  title text NULL,
  special_issue_id text NULL,
  section_id text NULL,
  "version" text NULL,
  manuscript_version_id text NULL,
  last_version_index int4 NULL,
  CONSTRAINT submission_data_pkey PRIMARY KEY (event_id)
)`;
  }

  public getTriggerQuery(): string {
    return `
create or replace FUNCTION ${this.getTriggerName()}()
RETURNS trigger as 
$$
declare
  _last_version_index int;
begin
	SELECT
        t.manuscripts_array_index - 1 into _last_version_index
      from
        (
        SELECT
          sd.version_arr,
          row_number() over(partition by sd.event_id)::int as manuscripts_array_index,
          row_number() over(partition by sd.event_id order by sd.version_arr desc)::int as rn
        FROM(
          select
          	NEW.id as event_id,
            string_to_array("version", '.')::int[] as version_arr
          FROM
            jsonb_to_recordset(((NEW.payload -> 'manuscripts'))) as manuscripts_view("version" text)) sd 
        ) t
        WHERE t.rn = 1;

    insert into ${this.getViewName()} values(NEW.id,
	    NEW.time,
	    NEW.type,
	    NEW.payload ->> 'submissionId'::text,
	    ((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'customId'::text,
	    (((NEW.payload -> 'manuscripts') -> _last_version_index) -> 'articleType'::text) ->> 'name'::text,
	    (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'created'::text)::timestamp without time zone,
	    COALESCE((((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'updated'::text)::timestamp without time zone, NEW.time),
	    ((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'journalId'::text,
	    ((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'title'::text,
	    (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'specialIssueId'),
	    (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'sectionId'),
	    (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'version'),
	    (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'id'),
	    _last_version_index) ON CONFLICT (event_id) DO NOTHING;
    RETURN NEW;
END
$$
language plpgsql;
create trigger after_se_insert after insert on ${REPORTING_TABLES.SUBMISSION}
for each row 
execute procedure ${this.getTriggerName()}();
    `;
  }

  getTriggerName() {
    return 'insert_into_submission_data';
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
