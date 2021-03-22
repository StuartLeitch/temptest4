import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: article_data');
  let queryStart = new Date();

  await knex.raw(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS article_data
    AS
    SELECT
      ae.id AS event_id,
      ae."time" AS event_timestamp,
      ae."type" AS "event",
      author_view.title,
      cast_to_timestamp(author_view.published) AS published_date,
      author_view."customId" AS manuscript_custom_id,
      author_view."submissionId" AS submission_id,
      author_view.doi,
      author_view.volume,
      author_view."figCount" AS fig_count,
      author_view."refCount" AS ref_count,
      author_view."journalId" AS journal_id,
      author_view."pageCount" AS page_count,
      author_view."hasSupplementaryMaterials" AS has_supplementary_materials
    FROM
      ${REPORTING_TABLES.ARTICLE} ae,
      jsonb_to_record(ae.payload) AS author_view (doi text,
        volume text,
        "customId" text,
        "figCount" int,
        "refCount" int,
        "journalId" text,
        "pageCount" int,
        "published" text,
        "hasSupplementaryMaterials" bool,
        "specialIssueId" text,
        "submissionId" text,
        title text)
    WITH NO DATA;
    `
  );

  const postCreateQueries = [
    `CREATE index on article_data (event_id)`,
    `CREATE index on article_data (event_timestamp)`,
    `CREATE index on article_data (event)`,
    `CREATE index on article_data (manuscript_custom_id)`,
    `CREATE index on article_data (journal_id)`,
    `CREATE index on article_data (published_date)`,
    `CREATE index on article_data (submission_id)`,
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
    `Creating table and indices article_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322122200_create_article_data_mv.ts';
