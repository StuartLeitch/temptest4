import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';

import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class PeerReviewDataView
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS 
SELECT
    pre.id AS event_id,
    pre."time" AS event_timestamp,
    pre."type" AS "event",
    author_view."customId" AS manuscript_custom_id,
    author_view."submissionId" AS submission_id
FROM
${REPORTING_TABLES.PEER_REVIEW} pre,
jsonb_to_record(pre.payload) AS author_view (
    "customId" text,
    "submissionId" text,
)
WITH DATA;
        `;
  }
  postCreateQueries = [
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (event)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (submission_id)`,
  ];

  getViewName(): string {
    return 'peer_review_data';
  }
}

const peerReviewData = new PeerReviewDataView();

export default peerReviewData;
