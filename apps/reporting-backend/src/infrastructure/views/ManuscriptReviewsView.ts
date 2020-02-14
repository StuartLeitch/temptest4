import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import submissionView from './SubmissionsView';

class ManuscriptReviewsView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT se.manuscript_custom_id,
  review_view.id as review_id,
  review_view.created as created_date,
  review_view.updated as updated_date,
  review_view.submitted as submitted_date,
  review_view.recommendation,
  review_view."teamMemberId" as team_member_id,
  se.event_id
 FROM ( SELECT s.last_version_index,
      se_1.payload,
      s.event_id,
      s.manuscript_custom_id
    FROM ${REPORTING_TABLES.SUBMISSION} se_1
    JOIN ${submissionView.getViewName()} s ON s.event_id = se_1.id) se,
  LATERAL jsonb_to_recordset(((se.payload -> 'manuscripts'::text) -> se.last_version_index) -> 'reviews'::text) 
  review_view(id text, created timestamp, updated timestamp, submitted timestamp, recommendation text, "teamMemberId" text)
WITH DATA;
`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (created_date)`,
    `create index on ${this.getViewName()} (updated_date)`,
    `create index on ${this.getViewName()} (submitted_date)`,
    `create index on ${this.getViewName()} (recommendation)`
  ];

  getViewName(): string {
    return 'manuscript_reviews';
  }
}

const manuscriptReviewsView = new ManuscriptReviewsView();
manuscriptReviewsView.addDependency(submissionView);

export default manuscriptReviewsView;
