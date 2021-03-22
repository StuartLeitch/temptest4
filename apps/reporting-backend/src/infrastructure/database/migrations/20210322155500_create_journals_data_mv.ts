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
  CREATE MATERIALIZED VIEW IF NOT EXISTS journals_data
AS SELECT journal_events.id AS event_id,
    journal_events.type AS event,
    journal_events.payload ->> 'id'::text AS journal_id,
    journal_events.payload ->> 'issn'::text AS journal_issn,
    journal_events.payload ->> 'name'::text AS journal_name,
    (journal_events.payload ->> 'isActive'::text)::boolean AS is_active,
    journal_events.payload ->> 'code'::text AS journal_code,
    journal_events.payload ->> 'apc'::text AS apc,
    journal_events.payload ->> 'email'::text AS journal_email,
    journal_events.payload ->> 'publisherName'::text AS publisher_name,
    journal_events.payload -> 'peerReviewModel' ->> 'name'::text AS peer_review_model,
    coalesce(journal_events.time, cast_to_timestamp(journal_events.payload ->> 'updated'::text), cast_to_timestamp('1980-01-01')) as event_date,
    cast_to_timestamp(journal_events.payload ->> 'updated'::text) AS updated_date
    FROM ${REPORTING_TABLES.JOURNAL}
WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE INDEX ON journals_data USING btree (journal_id)`,
    `CREATE INDEX ON journals_data USING btree (journal_id, event_date)`,
    `CREATE INDEX ON journals_data (event_date)`,
    `CREATE INDEX ON journals_data (publisher_name)`,
    `CREATE INDEX ON journals_data USING btree (journal_id, journal_issn)`,
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
    `Creating table and indices journals_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322155500_create_journals_data_mv.ts';
