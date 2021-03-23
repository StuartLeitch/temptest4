import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journals');
  let queryStart = new Date();

  // * journals is dependant on:
  // * - journals_data

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
    `CREATE INDEX ON journals USING btree (journal_id)`,
    `CREATE INDEX ON journals USING btree (journal_id, event_date)`,
    `CREATE INDEX ON journals USING btree (journal_code)`,
    `CREATE INDEX ON journals USING btree (journal_name)`,
    `CREATE INDEX ON journals USING btree (publisher_name)`,
    `CREATE INDEX ON journals USING btree (journal_issn)`,
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
    `Creating table and indices journals took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323132000_create_journals_mv.ts';
