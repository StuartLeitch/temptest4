import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import {
  REPORTING_TABLES,
  CHECKER_SUBMISSION_EVENTS,
} from 'libs/shared/src/lib/modules/reporting/constants';

const checkerSubmissionEvents = CHECKER_SUBMISSION_EVENTS.map((e) => `'${e}'`);

class CheckerSubmissionData extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
    ce.id AS event_id,
    coalesce(ce."time", cast_to_timestamp(checker_view.updated), cast_to_timestamp('1980-01-01')) AS event_timestamp,
    ce."type" AS event,
    checker_view."teamId" as team_id,
    checker_view.id as checker_id,
    checker_view."submissionId" as submission_id,
    cast_to_timestamp(checker_view."assignationDate") as assignation_date,
    checker_view."givenNames" || ' ' || checker_view.surname as checker_name,
    checker_view.email as checker_email,
    checker_view."role" as checker_role,
    checker_view."isConfirmed" as is_confirmed
  FROM
    ${REPORTING_TABLES.CHECKER} ce,
    jsonb_to_record(ce.payload) AS checker_view (
      "givenNames" text,
      "surname" text,
      "role" text,
      "submissionId" text,
      updated text,
      id text,
      "teamId" text,
      "isConfirmed" bool,
      "assignationDate" text,
      email text
    )
  WHERE
    ce."type" in (${checkerSubmissionEvents.join(',')})
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event)`,
    `create index on ${this.getViewName()} (event, event_timestamp)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (checker_id)`,
    `create index on ${this.getViewName()} (team_id)`,
    `create index on ${this.getViewName()} (assignation_date)`,
    `create index on ${this.getViewName()} (submission_id, checker_role, assignation_date)`,
    `create index on ${this.getViewName()} (checker_role)`,
    `create index on ${this.getViewName()} (checker_email)`,
  ];

  getViewName(): string {
    return 'checker_submission_data';
  }
}
const checkerSubmissionData = new CheckerSubmissionData();

export default checkerSubmissionData;
