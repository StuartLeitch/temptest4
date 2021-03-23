import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journal_sections');
  let queryStart = new Date();

  // * journal_sections is dependant on:
  // * - journals

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS journal_sections
  AS SELECT
    uj.journal_id,
    uj.journal_name,
    uj.journal_issn,
    uj.journal_code,
    uj.event_date,
    section_view.id as "section_id",
    section_view.name as "section_name",
    section_view.created as "created_date",
    section_view.updated as "updated_date",
    section_view."specialIssues" as special_issues_json,
    section_view."editors" as editors_json
  FROM
    ${REPORTING_TABLES.JOURNAL} je
    JOIN journals uj on je.id = uj.event_id,
    LATERAL jsonb_to_recordset(je.payload -> 'sections') as section_view(id text, name text, created timestamp, updated timestamp, "specialIssues" jsonb, editors jsonb)
  WITH NO DATA;
  `);

  const postCreateQueries = [
    `CREATE INDEX ON journal_sections (journal_id)`,
    `CREATE INDEX ON journal_sections (journal_name)`,
    `CREATE INDEX ON journal_sections (event_date)`,
    `CREATE INDEX ON journal_sections (journal_code)`,
    `CREATE INDEX ON journal_sections (journal_issn)`,
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
    `Creating table and indices journal_sections took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323150600_create_journal_sections_mv.ts';
