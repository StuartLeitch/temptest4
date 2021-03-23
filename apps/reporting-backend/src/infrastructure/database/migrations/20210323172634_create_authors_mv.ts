import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: authors');
  let queryStart = new Date();

  // * authors is dependant on submissions

  const submissionViewName = 'submissions';

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS authors
  AS SELECT
    author_view.id,
    se.manuscript_custom_id as "manuscript_custom_id",
    author_view.email as "email",
    coalesce(c."name", author_view.country) as "country",
    author_view."isCorresponding" as is_corresponding,
    author_view."isSubmitting" as is_submitting,
    author_view."userId" as user_id,
    author_view."givenNames" as given_names,
    author_view."surname" as "surname",
    author_view."aff" as "aff",
    event_id
    FROM(
      SELECT
        s.last_version_index,
        se.payload,
        s.event_id,
        s.manuscript_custom_id
      FROM
        ${REPORTING_TABLES.SUBMISSION} se
      JOIN ${submissionViewName} s on
        s.event_id = se.id) se,
      jsonb_to_recordset(((se.payload -> 'manuscripts') -> se.last_version_index) -> 'authors') as author_view(
        id text,
        email text,
        country text,
        "userId" text,
        "isCorresponding" bool,
        "isSubmitting" bool,
        "givenNames" text,
        surname text,
        aff text
      )
      LEFT JOIN countries c on upper(author_view.country) = c.iso
  WITH NO DATA;
      `);

  const postCreateQueries = [
    `create index on authors (id)`,
    `create index on authors (manuscript_custom_id)`,
    `create index on authors (manuscript_custom_id, is_corresponding)`,
    `create index on authors (manuscript_custom_id, is_submitting)`,
    `create index on authors (email)`,
    `create index on authors (event_id)`,
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
    `Creating table and indices authors took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}
export async function down(knex: Knex): Promise<any> {}

export const name = '20210323172634_create_authors_mv.ts';
