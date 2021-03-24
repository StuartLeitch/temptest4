import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES, DELETED_MANUSCRIPTS_TABLE } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscript_users');
  let queryStart = new Date();

  // * manuscript_users is dependant on:
  // * - authors
  // * - manuscript_editors
  // * - manuscript_editors
  // * - manuscript_reviewers
  // * - manuscripts

  const authorsView = 'authors';
  const manuscriptsView = 'manuscripts';
  const manuscriptEditorsView = 'manuscript_editors';
  const manuscriptReviewersView = 'manuscript_reviewers';
  const usersDataView = 'users_data';

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS manuscript_users
  AS SELECT
    users.*,
    user_identities.orcid,
    m.submission_id,
    m.manuscript_version_id,
    m.journal_name,
    m.special_issue_custom_id,
    m.submission_date
    FROM (
      SELECT
        manuscript_custom_id,
        email,
        a.given_names,
        a.surname,
        'active' AS status,
        'author' AS ROLE
      FROM
        ${authorsView} a
      UNION
      SELECT
        manuscript_custom_id,
        email,
        me.given_names,
        me.surname,
        status,
        role_type
      FROM
        ${manuscriptEditorsView} me
      UNION
      SELECT
        manuscript_custom_id,
        email,
        mr.given_names,
        mr.surname,
        status,
        'reviewer' AS ROLE
      FROM
        ${manuscriptReviewersView} mr) AS users
    JOIN ${manuscriptsView} m ON m.manuscript_custom_id = users.manuscript_custom_id
    LEFT JOIN LATERAL ( select * from ${usersDataView} where email = users.email and orcid is not null limit 1) user_identities ON user_identities.email = users.email
  WITH NO DATA;
`);

  const postCreateQueries = [
    `create index on manuscript_users (submission_id)`,
    `create index on manuscript_users (manuscript_custom_id)`,
    `create index on manuscript_users (submission_date desc)`,
    `create index on manuscript_users (email)`,
    `create index on manuscript_users (status)`,
    `create index on manuscript_users (role)`,
    `create index on manuscript_users (submission_id)`,
    `create index on manuscript_users (manuscript_version_id)`,
    `create index on manuscript_users (journal_name)`,
    `create index on manuscript_users (special_issue_custom_id)`,
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
    `Creating materialized view and indices for "manuscript_users" took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210324102100_create_manuscript_users_mv.ts';
