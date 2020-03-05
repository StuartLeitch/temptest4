import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';

import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class ArticleDataView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS 
SELECT
	ae.id AS event_id,
	ae."time" AS event_timestamp,
	ae."type" AS "event",
	author_view.title,
	cast_to_timestamp(author_view.published) AS published_date,
	author_view."customId" AS manuscript_custom_id,
	author_view."submissionId" AS submission_id,
	author_view.doi,
	author_view.volume,
	author_view."figCount" AS fig_count,
	author_view."refCount" AS ref_count,
	author_view."journalId" AS journal_id,
	author_view."pageCount" AS page_count,
	author_view."hasSupplementaryMaterials" AS has_supplementary_materials
FROM
	${REPORTING_TABLES.ARTICLE} ae,
	jsonb_to_record(ae.payload) AS author_view (doi text,
		volume text,
		"customId" text,
		"figCount" int,
		"refCount" int,
		"journalId" text,
		"pageCount" int,
		"published" text,
		"hasSupplementaryMaterials" bool,
		"specialIssueId" text,
		"submissionId" text,
		title text)
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (event)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (journal_id)`,
    `create index on ${this.getViewName()} (published_date)`,
    `create index on ${this.getViewName()} (submission_id)`
  ];

  getViewName(): string {
    return 'article_data';
  }
}

const authorsView = new ArticleDataView();

export default authorsView;
