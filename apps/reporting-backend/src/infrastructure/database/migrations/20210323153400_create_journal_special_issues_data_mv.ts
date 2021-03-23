import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journal_special_issues_data');
  let queryStart = new Date();

  // * journal_special_issues_data is dependant on:
  // * - journals
  // * - journal sections

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS journal_special_issues_data
    AS SELECT
      j.journal_id,
      journal_name,
      j.journal_issn,
      j.journal_code,
      j.event_date,
      special_issues_view.id as special_issue_id,
      special_issues_view.name as special_issue_name,
      special_issues_view."customId" as special_issue_custom_id,
      cast_to_timestamp(special_issues_view."endDate") as closed_date,
      cast_to_timestamp(special_issues_view."startDate") as open_date,
      case
        when special_issues_view."isActive" = true then 'open'
        when special_issues_view."isCancelled" = true then 'cancelled'
        else 'closed'
      end as status,
      null as section_id,
      null as section_name,
      special_issues_view.editors as editors_json
    FROM
      ${REPORTING_TABLES.JOURNAL} je
      join journals j on je.id = j.event_id,
      lateral jsonb_to_recordset(je.payload -> 'specialIssues') as special_issues_view(id text, name text, "isActive" bool, "isCancelled" bool, "endDate" text, "startDate" text, "cancelReason" text, created text, updated text, "customId" text, editors jsonb)
    UNION ALL
    SELECT
      j.journal_id,
      journal_name,
      j.journal_issn,
      j.journal_code,
      j.event_date,
      special_issues_view.id as special_issue_id,
      special_issues_view.name as special_issue_name,
      special_issues_view."customId" as special_issue_custom_id,
      cast_to_timestamp(special_issues_view."endDate") as closed_date,
      cast_to_timestamp(special_issues_view."startDate") as open_date,
      case
        when special_issues_view."isActive" = true then 'open'
        when special_issues_view."isCancelled" = true then 'cancelled'
        else 'closed'
      end as status,
      j.section_id,
      j.section_name,
      special_issues_view.editors as editors_json
    FROM journal_sections j,
    LATERAL jsonb_to_recordset(j.special_issues_json) as special_issues_view(id text, name text, "isActive" bool, "isCancelled" bool, "endDate" text, "startDate" text, "cancelReason" text, created text, updated text, "customId" text, editors jsonb)
  WITH NO DATA
  `
  );

  const postCreateQueries = [
    `CREATE INDEX ON journal_special_issues_data (journal_id)`,
    `CREATE INDEX ON journal_special_issues_data (special_issue_id)`,
    `CREATE INDEX ON journal_special_issues_data (special_issue_name)`,
    `CREATE INDEX ON journal_special_issues_data (special_issue_custom_id)`,
    `CREATE INDEX ON journal_special_issues_data (event_date)`,
    `CREATE INDEX ON journal_special_issues_data (journal_code)`,
    `CREATE INDEX ON journal_special_issues_data (journal_name)`,
    `CREATE INDEX ON journal_special_issues_data (journal_issn)`,
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

export const name = '20210323153400_create_journal_special_issues_data_mv.ts';
