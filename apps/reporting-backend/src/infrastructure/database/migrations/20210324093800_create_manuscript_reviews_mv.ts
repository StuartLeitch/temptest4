import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscript_reviews');
  let queryStart = new Date();

  // * manuscript_reviews is dependant on:
  // * - submissions
  // * - authors
  // * - manuscript_reviewers
  // * - manuscript_editors

  const submissionView = 'submissions';
  const authorsView = 'authors';
  const manuscriptReviewersView = 'manuscript_reviewers';
  const manuscriptEditorsView = 'manuscript_editors';

  await knex.raw(`
CREATE MATERIALIZED VIEW IF NOT EXISTS manuscript_reviews
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
    s.journal_name,
    s.section_name,
    s.special_issue_name,
    s.special_issue_id,
    s.event_id
  from ${REPORTING_TABLES.SUBMISSION} se
    join ${submissionView} s on se.id = s.event_id,
    jsonb_array_elements(se.payload->'manuscripts') manuscripts,
    jsonb_to_recordset(manuscripts->'reviews') as
      review_view(id text, created timestamp, updated timestamp, submitted timestamp, recommendation text, "teamMemberId" text)
  ) reviews
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView} e where e.id = reviews.team_member_id limit 1) editors on editors.id = reviews.team_member_id
  LEFT JOIN LATERAL (SELECT * FROM ${manuscriptReviewersView} r where r.reviewer_id = reviews.team_member_id limit 1) reviewers on reviewers.reviewer_id = reviews.team_member_id
  LEFT JOIN LATERAL (SELECT * FROM ${authorsView} a where a.id = reviews.team_member_id limit 1) authors on authors.id = reviews.team_member_id
WITH NO DATA;
`);

  const postCreateQueries = [
    `create index on manuscript_reviews (manuscript_custom_id)`,
    `create index on manuscript_reviews (manuscript_custom_id, version)`,
    `create index on manuscript_reviews (version)`,
    `create index on manuscript_reviews (team_type)`,
    `create index on manuscript_reviews (manuscript_custom_id, team_type, submitted_date desc nulls last)`,
    `create index on manuscript_reviews (team_member_email)`,
    `create index on manuscript_reviews (team_member_email, team_type)`,
    `create index on manuscript_reviews (created_date)`,
    `create index on manuscript_reviews (updated_date)`,
    `create index on manuscript_reviews (team_member_id)`,
    `create index on manuscript_reviews (submitted_date)`,
    `create index on manuscript_reviews (recommendation)`,
  ];

  for (const indexQuery of postCreateQueries) {
    const indexQueryStart = new Date();
    await knex.raw(indexQuery);
    logger.debug(
      `Creating indices ${indexQuery} took ${differenceInSeconds(
        indexQueryStart
      )} seconds`
    );
  }

  logger.info(
    `Creating table and indices manuscript_reviews took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210324093800_create_manuscript_reviews_mv.ts';
