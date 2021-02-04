import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class SubmissionDataView
  extends AbstractEventView
  implements EventViewContract {
  private insertTrigger = 'after_se_insert';
  private updateTrigger = 'after_se_update';
  getCreateQuery(): string {
    return `
CREATE TABLE ${this.getViewName()} (
  event_id uuid NULL,
  event_timestamp timestamptz NULL,
  submission_event varchar(255) NULL,
  submission_id text NULL,
  manuscript_custom_id text NULL,
  article_type text NULL,
  journal_id text NULL,
  title text NULL,
  special_issue_id text NULL,
  section_id text NULL,
  "version" text NULL,
  manuscript_version_id text NULL,
  last_version_index int4 NULL,
  CONSTRAINT submission_data_pkey PRIMARY KEY (event_id)
)`;
    // preprint_value text NULL
  }

  public getTriggerQuery(): string {
    return `
${this.getTriggerFunction()}
DROP TRIGGER IF EXISTS ${this.insertTrigger} on "public".${
      REPORTING_TABLES.SUBMISSION
    };
create trigger ${this.insertTrigger} after insert on ${
      REPORTING_TABLES.SUBMISSION
    }
for each row 
execute procedure ${this.getTriggerName()}();

DROP TRIGGER IF EXISTS ${this.updateTrigger} on "public".${
      REPORTING_TABLES.SUBMISSION
    };
create trigger ${this.updateTrigger} after update on ${
      REPORTING_TABLES.SUBMISSION
    }
for each row 
execute procedure ${this.getTriggerName()}();
    `;
  }

  public getTriggerFunction(): string {
    return `create or replace FUNCTION ${this.getTriggerName()}()
    RETURNS trigger as 
    $$
    declare
      _last_version_index int;
    begin
      SELECT
        t.manuscripts_array_index - 1 into _last_version_index
      from (
        select 
          *, row_number() over(partition by sd.event_id order by sd.version_arr desc)::int as rn
        from (
          SELECT
            sd.event_id,
            sd.version_arr,
            row_number() over(partition by sd.event_id)::int as manuscripts_array_index
          FROM(
            select
              NEW.id as event_id,
              string_to_array("version", '.')::int[] as version_arr
            FROM
              jsonb_to_recordset(((NEW.payload -> 'manuscripts'))) as manuscripts_view("version" text)) sd 
          ) sd
        ) t WHERE t.rn = 1;
    
        insert into ${this.getViewName()} values(NEW.id,
          coalesce(NEW.time, cast_to_timestamp(((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'updated'), '1980-01-01'),
          NEW.type,
          NEW.payload ->> 'submissionId'::text,
          ((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'customId'::text,
          (((NEW.payload -> 'manuscripts') -> _last_version_index) -> 'articleType'::text) ->> 'name'::text,
          ((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'journalId'::text,
          ((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'title'::text,
          (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'specialIssueId'),
          (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'sectionId'),
          (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'version'),
          (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'id'),
          _last_version_index, 
          (((NEW.payload -> 'manuscripts') -> _last_version_index) ->> 'preprintValue')) ON CONFLICT (event_id) DO UPDATE set
            event_timestamp = excluded.event_timestamp,
            submission_event = excluded.submission_event,
            submission_id = excluded.submission_id,
            manuscript_custom_id = excluded.manuscript_custom_id,
            article_type = excluded.article_type,
            journal_id = excluded.journal_id,
            title = excluded.title,
            special_issue_id = excluded.special_issue_id,
            section_id = excluded.section_id,
            "version" = excluded."version",
            manuscript_version_id = excluded.manuscript_version_id,
            last_version_index = excluded.last_version_index,
            preprint_value = excluded.preprint_value;
        RETURN NEW;
    END
    $$
    language plpgsql;`;
  }

  getTriggerName() {
    return 'insert_into_submission_data';
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (journal_id)`,
    // add index in migration, not here
  ];

  getViewName(): string {
    return 'submission_data';
  }
}
const submissionDataView = new SubmissionDataView();

export default submissionDataView;
