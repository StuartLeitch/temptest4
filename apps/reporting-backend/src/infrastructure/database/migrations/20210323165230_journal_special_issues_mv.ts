import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journal_special_issues');
  let queryStart = new Date();

  //* journal_special_issues is dependant on: journal_special_issues_data, journal_editorial_board

  const journalSpecialIssuesDataViewName = 'journal_special_issues_data';
  const journalEditorialBoardViewName = 'journal_editorial_board';

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS journal_special_issues AS
    SELECT 
    si_data.journal_id,
    si_data.journal_name,
    si_data.journal_issn,
    si_data.journal_code,
    si_data.event_date,
    si_data.special_issue_id,
    si_data.special_issue_name,
    si_data.special_issue_custom_id,
    si_data.closed_date,
    si_data.open_date,
    si_data.status,
    si_data.section_id,
    si_data.section_name,
    concat(lead_guest_editor.given_names, ' ', lead_guest_editor.surname) as lead_guest_editor_name,
    lead_guest_editor.email as lead_guest_editor_email,
    lead_guest_editor.aff as lead_guest_editor_affiliation,
    lead_guest_editor.country as lead_guest_editor_country,
    editors_counts.editor_count
    FROM ${journalSpecialIssuesDataViewName} si_data
    LEFT JOIN LATERAL (
      SELECT 
        special_issue_id,
        count(*) as editor_count
      FROM ${journalEditorialBoardViewName} jeb
        WHERE jeb.special_issue_id = si_data.special_issue_id
          AND role_type = 'academicEditor'
      GROUP BY special_issue_id
    ) editors_counts on editors_counts.special_issue_id = si_data.special_issue_id
    LEFT JOIN LATERAL (
      SELECT *    
      FROM ${journalEditorialBoardViewName} jeb
        WHERE jeb.special_issue_id = si_data.special_issue_id
          AND role_type = 'triageEditor'
      ORDER BY invited_date desc nulls last
      LIMIT 1
    ) lead_guest_editor on lead_guest_editor.special_issue_id = si_data.special_issue_id
  WITH NO DATA
      `);

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
    `Creating table and indices journal_editorial_board took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323165230_journal_special_issues_mv.ts';
