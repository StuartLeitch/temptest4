import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import submissionView from './SubmissionsView';

class ManuscriptReviewsView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT s.manuscript_custom_id,
  manuscripts->>'version' as "version",
  review_view.id as review_id,
  review_view.created as created_date,
  review_view.updated as updated_date,
  review_view.submitted as submitted_date,
  review_view.recommendation,
  review_view."teamMemberId" as team_member_id,
  s.event_id
from ${REPORTING_TABLES.SUBMISSION} se	
  join ${submissionView.getViewName()} s on se.id = s.event_id,
  jsonb_array_elements(se.payload->'manuscripts') manuscripts,
  jsonb_to_recordset(manuscripts->'reviews') as 
    review_view(id text, created timestamp, updated timestamp, submitted timestamp, recommendation text, "teamMemberId" text)
WITH DATA;
`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, version)`,
    `create index on ${this.getViewName()} (version)`,
    `create index on ${this.getViewName()} (created_date)`,
    `create index on ${this.getViewName()} (updated_date)`,
    `create index on ${this.getViewName()} (team_member_id)`,
    `create index on ${this.getViewName()} (submitted_date)`,
    `create index on ${this.getViewName()} (recommendation)`,
  ];

  getViewName(): string {
    return 'manuscript_reviews';
  }
}

const manuscriptReviewsView = new ManuscriptReviewsView();
manuscriptReviewsView.addDependency(submissionView);

export default manuscriptReviewsView;
