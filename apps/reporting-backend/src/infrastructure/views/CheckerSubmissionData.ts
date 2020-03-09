import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import {
  REPORTING_TABLES,
  CHECKER_SUBMISSION_EVENTS
} from 'libs/shared/src/lib/modules/reporting/constants';

const checkerSubmissionEvents = CHECKER_SUBMISSION_EVENTS.map(e => `'${e}'`);

class CheckerSubmissionData extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
    ce.id AS event_id,
    ce."time" AS event_timesampt,
    ce."type" AS event,
    checker_view."teamId" as team_id,
    checker_view.id as checker_id,
    checker_view."submissionId" as submission_id,
    cast_to_timestamp(checker_view."assignationDate") as assignation_date,
    checker_view."givenNames" || ' ' || checker_view.surname as checker_name,
    checker_view."role" as checker_role,
    checker_view."isConfirmed" as is_confirmed
  FROM
    ${REPORTING_TABLES.CHECKER} ce,
    jsonb_to_record(ce.payload) AS checker_view (
      "givenNames" text,
      "surname" text,
      "role" text,
      "submissionId" text,
      id text,
      "teamId" text,
      "isConfirmed" bool,
      "assignationDate" text
    )
  WHERE
    ce."type" in (${checkerSubmissionEvents.join(',')})
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`
  ];

  getViewName(): string {
    return 'checker_submission_data';
  }
}
const checkerSubmissionData = new CheckerSubmissionData();

export default checkerSubmissionData;
