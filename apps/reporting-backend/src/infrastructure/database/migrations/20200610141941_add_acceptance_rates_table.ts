import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {

  let queryStart = new Date();
  await knex.raw(`
    CREATE TABLE acceptance_rates (
      journal_id text,
      month date,
      journal_rate numeric,
      paid_regular_rate numeric,
      paid_special_issue_rate numeric,
      free_rate numeric
    )`
  );

  const postCreateQueries = [
    `CREATE index on acceptance_rates (journal_id)`,
    `CREATE index on acceptance_rates (month)`,
    `CREATE index on acceptance_rates (journal_id, month)`,
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
    `Creating table and indices acceptance_rates took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP table acceptance_rates cascade`);
}

export const name = '20200610141941_add_acceptance_rates_table.ts';
