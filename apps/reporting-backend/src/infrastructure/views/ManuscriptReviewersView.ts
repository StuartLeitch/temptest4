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
AS select se.manuscript_custom_id as "manuscript_custom_id",
  manuscripts->>'version' as "version",
  reviewer_view.email as "email",
  cast_to_timestamp(reviewer_view.responded) as "responded_date",
  reviewer_view."fromService" as from_service,
  cast_to_timestamp(reviewer_view."expiredDate") as expired_date,
  cast_to_timestamp(reviewer_view."invitedDate") as invited_date,
  cast_to_timestamp(reviewer_view."acceptedDate") as accepted_date,
  cast_to_timestamp(reviewer_view."declinedDate") as declined_date,
  reviewer_view.status as "status",
  reviewer_view."aff" as "aff",
  reviewer_view.country as "country",
  reviewer_view."userId" as user_id,
  reviewer_view."givenNames" as given_names,
  reviewer_view."surname" as "surname",
  cast_to_timestamp(reviewer_view.created) as "created_date",
  cast_to_timestamp(reviewer_view.updated) as "updated_date",
  event_id from (select s.*, se.payload
from ${REPORTING_TABLES.SUBMISSION} se	
  join ${submissionView.getViewName()} s on se.id = s.event_id) se,
  jsonb_array_elements(se.payload->'manuscripts') manuscripts,
  jsonb_to_recordset(manuscripts->'reviewers') as reviewer_view(
    email text,
    "fromService" text,
    "expiredDate" text,
    "invitedDate" text,
    "acceptedDate" text,
    "declinedDate" text,
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
    `create index on ${this.getViewName()} (version)`,
    `create index on ${this.getViewName()} (responded_date)`,
    `create index on ${this.getViewName()} (created_date)`,
    `create index on ${this.getViewName()} (expired_date)`,
    `create index on ${this.getViewName()} (invited_date)`,
    `create index on ${this.getViewName()} (accepted_date)`,
    `create index on ${this.getViewName()} (declined_date)`,
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
