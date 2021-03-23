import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journals');
  let queryStart = new Date();

  // * journals is dependant on:
  // * - journals_data
  // * - acceptance_rates

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS journals
AS SELECT j1.event,
    j1.journal_id,
    j1.journal_issn,
    j1.journal_name,
    j1.peer_review_model,
    COALESCE(publisher.publisher_name, j1.publisher_name, 'Hindawi') as publisher_name,
    j1.is_active,
    j1.journal_code,
    j1.journal_email,
    j1.apc,
    j1.event_date,
    j1.event_id,
    individual_ar.journal_rate as current_journal_acceptance_rate,
    global_ar.journal_rate as current_global_acceptance_rate
  FROM (select *, row_number() over (partition by journal_id order by event_date desc nulls last) as rn from journals_data jd) j1
  LEFT JOIN journal_to_publisher publisher on j1.journal_id = publisher.journal_id
  LEFT JOIN (SELECT journal_id, "month", avg(journal_rate) as journal_rate from acceptance_rates group by journal_id, "month") individual_ar on individual_ar."month" = to_char(now(), 'YYYY-MM-01')::date and j1.journal_id = individual_ar.journal_id
  LEFT JOIN (SELECT "month", avg(journal_rate) as journal_rate from acceptance_rates where journal_rate is not null group by "month") global_ar on global_ar."month" = to_char(now(), 'YYYY-MM-01')::date
  WHERE rn = 1
WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE index on checker_to_team (event_id)`,
    `CREATE index on checker_to_team (event)`,
    `CREATE index on checker_to_team (event_timestamp)`,
    `CREATE index on checker_to_team (team_id)`,
    `CREATE index on checker_to_team (team_type)`,
    `CREATE index on checker_to_team (checker_id)`,
    `CREATE index on checker_to_team (checker_role)`,
    `CREATE index on checker_to_team (checker_email)`,
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
    `Creating table and indices checker_to_team took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323123600_create_checker_to_team.ts';
