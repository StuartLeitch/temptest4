import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import submissionView from './SubmissionsView';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class AuthorsView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
  se.manuscript_custom_id as "manuscript_custom_id",
  author_view.email as "email",
  author_view.country as "country",
  author_view."isCorresponding" as is_corresponding,
  author_view."isSubmitting" as is_submitting,
  author_view."givenNames" as given_names,
  author_view."surname" as "surname",
  author_view."aff" as "aff",
  event_id
  FROM(
    SELECT
      s.last_version_index,
      se.payload,
      s.event_id,
      s.manuscript_custom_id
    FROM
      ${REPORTING_TABLES.SUBMISSION} se
    JOIN ${submissionView.getViewName()} s on
      s.event_id = se.id) se,
    jsonb_to_recordset(((se.payload -> 'manuscripts') -> se.last_version_index) -> 'authors') as author_view(
      email text,
      country text,
      "isCorresponding" bool,
      "isSubmitting" bool,
      "givenNames" text,
      surname text,
      aff text
    )
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (email)`,
    `create index on ${this.getViewName()} (event_id)`
  ];

  getViewName(): string {
    return 'authors';
  }
}

const authorsView = new AuthorsView();
authorsView.addDependency(submissionView);

export default authorsView;
