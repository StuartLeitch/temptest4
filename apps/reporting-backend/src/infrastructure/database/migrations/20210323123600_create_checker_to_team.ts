import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: checker_to_submission');
  let queryStart = new Date();

  // * checker_to_submission is dependant on checker_submission_data

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS checker_to_submission
  AS SELECT
    event_id,
    event_timestamp,
    event,
    team_id,
    checker_id,
    submission_id,
    assignation_date,
    checker_name,
    checker_email,
    checker_role,
    is_confirmed
  FROM (
    SELECT
      *,
      row_number() OVER (PARTITION BY submission_id, checker_role ORDER BY assignation_date DESC) AS rn
    FROM
    checker_submission_data) c
  WHERE
    c.rn = 1
  WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE index on checker_to_submission (event_id)`,
    `CREATE index on checker_to_submission (event)`,
    `CREATE index on checker_to_submission (event, event_timestamp)`,
    `CREATE index on checker_to_submission (event_timestamp)`,
    `CREATE index on checker_to_submission (submission_id)`,
    `CREATE index on checker_to_submission (checker_id)`,
    `CREATE index on checker_to_submission (team_id)`,
    `CREATE index on checker_to_submission (assignation_date)`,
    `CREATE index on checker_to_submission (submission_id, assignation_date)`,
    `CREATE index on checker_to_submission (checker_role)`,
    `CREATE index on checker_to_submission (checker_email)`,
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
    `Creating table and indices checker_to_submission took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322162600_create_checker_to_submission.ts';
