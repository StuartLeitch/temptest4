import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES, CHECKER_TEAM_EVENTS } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

const checkerTeamEvents = CHECKER_TEAM_EVENTS.map((e) => `'${e}'`);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: checker_team_data');
  let queryStart = new Date();

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS checker_team_data
AS SELECT
    ce.id AS event_id,
    coalesce(ce."time", cast_to_timestamp(checker_team_view.updated), cast_to_timestamp('1980-01-01')) AS event_timestamp,
    ce."type" AS event,
    checker_team_view.id as team_id,
    checker_team_view.name as team_name,
    checker_team_view.type as team_type
  FROM
    ${REPORTING_TABLES.CHECKER} ce,
    jsonb_to_record(ce.payload) AS checker_team_view (
      name text,
      "type" text,
      updated text,
      id text
    )
  WHERE
    ce."type" in (${checkerTeamEvents.join(',')})
WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE index on checker_team_data (event_id)`,
    `CREATE index on checker_team_data (event)`,
    `CREATE index on checker_team_data (event, event_timestamp)`,
    `CREATE index on checker_team_data (event_timestamp)`,
    `CREATE index on checker_team_data (team_id)`,
    `CREATE index on checker_team_data (team_type)`,
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
    `Creating table and indices checker_team_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322152400_create_checker_team_data_mv.ts';
