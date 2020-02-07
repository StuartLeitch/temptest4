import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import submissionView from './SubmissionsView';

class ManuscriptReviewersView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
  se.manuscript_custom_id as "manuscript_custom_id",
  reviewer_view.email as "email",
  reviewer_view.responded::timestamp as "responded_date",
  reviewer_view.status as "status",
  reviewer_view."aff" as "aff",
  reviewer_view.country as "country",
  reviewer_view."userId" as user_id,
  reviewer_view."givenNames" as given_names,
  reviewer_view."surname" as "surname",
  reviewer_view.created::timestamp as "created_date",
  reviewer_view.updated::timestamp as "updated_date",
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
    jsonb_to_recordset(((se.payload -> 'manuscripts') -> se.last_version_index) -> 'reviewers') as reviewer_view(
      email text,
      country text,
      "userId" text,
      "givenNames" text,
      surname text,
      aff text,
      created text,
      updated text,
      responded text,
      status text
    )
WITH DATA;
`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (responded_date)`,
    `create index on ${this.getViewName()} (created_date)`,
    `create index on ${this.getViewName()} (status)`,
    `create index on ${this.getViewName()} (email)`,
    `create index on ${this.getViewName()} (user_id)`,
    `create index on ${this.getViewName()} (event_id)`
  ];

  getViewName(): string {
    return 'manuscript_reviewers';
  }
}

const manuscriptReviewers = new ManuscriptReviewersView();
manuscriptReviewers.addDependency(submissionView);

export default manuscriptReviewers;
