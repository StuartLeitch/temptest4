import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES, CHECKER_SUBMISSION_EVENTS } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

const checkerSubmissionEvents = CHECKER_SUBMISSION_EVENTS.map((e) => `'${e}'`);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: checker_submission_data');
  let queryStart = new Date();

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS checker_submission_data
AS SELECT
    ce.id AS event_id,
    coalesce(ce."time", cast_to_timestamp(checker_view.updated), cast_to_timestamp('1980-01-01')) AS event_timestamp,
    ce."type" AS event,
    checker_view."teamId" as team_id,
    checker_view.id as checker_id,
    checker_view."submissionId" as submission_id,
    cast_to_timestamp(checker_view."assignationDate") as assignation_date,
    checker_view."givenNames" || ' ' || checker_view.surname as checker_name,
    checker_view.email as checker_email,
    checker_view."role" as checker_role,
    checker_view."isConfirmed" as is_confirmed
  FROM
    ${REPORTING_TABLES.CHECKER} ce,
    jsonb_to_record(ce.payload) AS checker_view (
      "givenNames" text,
      "surname" text,
      "role" text,
      "submissionId" text,
      updated text,
      id text,
      "teamId" text,
      "isConfirmed" bool,
      "assignationDate" text,
      email text
    )
  WHERE
    ce."type" in (${checkerSubmissionEvents.join(',')})
  WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE INDEX ON checker_submission_data (event)`,
    `CREATE INDEX ON checker_submission_data (event_id)`,
    `CREATE INDEX ON checker_submission_data (event, event_timestamp)`,
    `CREATE INDEX ON checker_submission_data (event_timestamp)`,
    `CREATE INDEX ON checker_submission_data (submission_id)`,
    `CREATE INDEX ON checker_submission_data (checker_id)`,
    `CREATE INDEX ON checker_submission_data (team_id)`,
    `CREATE INDEX ON checker_submission_data (assignation_date)`,
    `CREATE INDEX ON checker_submission_data (submission_id, checker_role, assignation_date)`,
    `CREATE INDEX ON checker_submission_data (checker_role)`,
    `CREATE INDEX ON checker_submission_data (checker_email)`
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
    `Creating table and indices checker_submission_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322152400_create_checker_submission_data_mv.ts';
