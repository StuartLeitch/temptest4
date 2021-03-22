import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES, CHECKER_TEAM_EVENTS } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

const checkerTeamEvents = CHECKER_TEAM_EVENTS.map((e) => `'${e}'`);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journals_data');
  let queryStart = new Date();

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS peer_review_data
  AS
  SELECT
      pre.id AS event_id,
      pre."time" AS event_timestamp,
      pre."type" AS "peer_review_event",
      author_view."customId" AS manuscript_custom_id,
      author_view."submissionId" AS submission_id
  FROM
  ${REPORTING_TABLES.PEER_REVIEW} pre,
  jsonb_to_record(pre.payload) AS author_view ("customId" text, "submissionId" text)
  WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE index on peer_review_data (event_id)`,
    `CREATE index on peer_review_data (event_timestamp)`,
    `CREATE index on peer_review_data (peer_review_event)`,
    `CREATE index on peer_review_data (manuscript_custom_id)`,
    `CREATE index on peer_review_data (submission_id)`,
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
    `Creating table and indices peer_review_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322160500_create_peer_review_data_mv.ts';
