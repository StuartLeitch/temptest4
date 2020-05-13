import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import authorsView from './AuthorsView';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import manuscriptEditorsView from './ManuscriptEditorsView';
import manuscriptReviewers from './ManuscriptReviewersView';
import submissionView from './SubmissionsView';

class ManuscriptReviewsView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT 
    reviews.*,
    case
      when editors.id is not null then editors.email
      when reviewers.reviewer_id is not null then reviewers.email
      when authors.id is not null then authors.email
      else null
    end as team_member_email,
    case 
      when editors.id is not null then 'editor'
      when reviewers.reviewer_id is not null then 'reviewer'
      when authors.id is not null then 'author'
      else null
    end as team_type
  FROM (SELECT s.manuscript_custom_id,
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
  ) reviews
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView.getViewName()} e where e.id = reviews.team_member_id limit 1) editors on editors.id = reviews.team_member_id
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptReviewers.getViewName()} r where r.reviewer_id = reviews.team_member_id limit 1) reviewers on reviewers.reviewer_id = reviews.team_member_id
  LEFT JOIN LATERAL (SELECT * FROM ${authorsView.getViewName()} a where a.id = reviews.team_member_id limit 1) authors on authors.id = reviews.team_member_id
WITH DATA;
`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, version)`,
    `create index on ${this.getViewName()} (version)`,
    `create index on ${this.getViewName()} (team_type)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, team_type, submitted_date desc nulls last)`,
    `create index on ${this.getViewName()} (team_member_email)`,
    `create index on ${this.getViewName()} (team_member_email, team_type)`,
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
manuscriptReviewsView.addDependency(authorsView);
manuscriptReviewsView.addDependency(manuscriptReviewers);
manuscriptReviewsView.addDependency(manuscriptEditorsView);

export default manuscriptReviewsView;
