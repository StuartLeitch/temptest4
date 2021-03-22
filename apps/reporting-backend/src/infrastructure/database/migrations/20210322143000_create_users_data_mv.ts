import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: users_data');
  let queryStart = new Date();

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS users_data
  as (WITH identities AS (
    SELECT
      ue.payload ->> 'id' AS unique_id,
      time AS event_timestamp,
      ue.id AS event_id,
      identity_view.* AS unique_id
    FROM
      ${REPORTING_TABLES.USER} ue,
      jsonb_to_recordset(ue.payload -> 'identities') AS identity_view (TYPE text,
        identifier text,
        email text)
  )
  SELECT
    local_identity.event_id,
    local_identity.event_timestamp,
    local_identity.email,
    local_identity.unique_id,
    orcid_identity.identifier AS orcid
  FROM (
    SELECT
      *
    FROM
      identities
    WHERE
      TYPE = 'local') AS local_identity
    LEFT JOIN (
      SELECT
        *
      FROM
        identities
      WHERE
        TYPE = 'orcid') AS orcid_identity ON local_identity.unique_id = orcid_identity.unique_id)
  WITH NO DATA;
    `
  );

  const postCreateQueries = [
    `CREATE INDEX ON users_data USING btree (email)`,
    `CREATE INDEX ON users_data USING btree (orcid)`,
    `CREATE INDEX ON users_data USING btree (email, orcid)`,
    `CREATE INDEX ON users_data USING btree (event_id)`,
    `CREATE INDEX ON users_data USING btree (event_timestamp)`,
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
    `Creating table and indices users_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322143000_create_users_data_mv.ts';
