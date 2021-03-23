import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: journal_editorial_board');
  let queryStart = new Date();

  // * journal_editorial_board is dependant on:
  // * - journals
  // * - journal_sections
  // * - journal_special_issues_data

  const journalsViewName = 'journals';
  const journalSectionViewName = 'journal_sections';
  const journalSpecialIssuesDataViewName = 'journal_special_issues_data';

  await knex.raw(`
CREATE MATERIALIZED VIEW IF NOT EXISTS journal_editorial_board
AS SELECT
	j.journal_id,
	j.journal_name,
	j.section_id,
	j.section_name,
	j.special_issue_id,
	j.special_issue_name,
	editor_view.email AS "email",
	editor_view. "givenNames" AS given_names,
	editor_view. "surname" AS "surname",
	editor_view. "aff" AS "aff",
	editor_view. "status" AS "status",
	editor_view. "role" ->> 'type' AS role_type,
	editor_view. "role" ->> 'label' AS role_label,
	cast_to_timestamp (editor_view. "invitedDate") AS invited_date,
	cast_to_timestamp (editor_view. "assignedDate") AS assigned_date,
	editor_view.country AS "country",
	editor_view. "isCorresponding" AS is_corresponding,
	editor_view. "userId" AS user_id
FROM (
	SELECT
		j.journal_id,
		j.journal_name,
		NULL AS section_id,
		NULL AS section_name,
		NULL AS special_issue_id,
		NULL AS special_issue_name,
		je.payload -> 'editors' AS editors
	FROM
		${journalsViewName} j
		JOIN ${REPORTING_TABLES.JOURNAL} je ON je.id = j.event_id
UNION ALL
SELECT
	js.journal_id,
	js.journal_name,
	js.section_id,
	js.section_name,
	NULL AS special_issue_id,
	NULL AS special_issue_name,
	js.editors_json AS editors
FROM
	${journalSectionViewName} js
UNION ALL
SELECT
	jsi.journal_id,
	jsi.journal_name,
	jsi.section_id,
	jsi.section_name,
	jsi.special_issue_id,
	jsi.special_issue_name,
	jsi.editors_json AS editors
FROM
	${journalSpecialIssuesDataViewName} jsi) j,
	jsonb_to_recordset(j.editors) AS editor_view ("expiredDate" text,
		"invitedDate" text,
		"removedDate" text,
		"acceptedDate" text,
		"assignedDate" text,
		"declinedDate" text,
		status text,
		email text,
		country text,
		"isCorresponding" bool,
		"userId" text,
		"givenNames" text,
		surname text,
		aff text,
		ROLE jsonb)
WHERE
	jsonb_array_length(j.editors) > 0
WITH NO DATA `);

  const postCreateQueries = [
    `create index on journal_editorial_board (email)`,
    `create index on journal_editorial_board (role_type)`,
    `create index on journal_editorial_board (special_issue_id)`,
    `create index on journal_editorial_board (invited_date desc nulls last)`,
    `create index on journal_editorial_board (invited_date desc nulls last, special_issue_id)`,
    `create index on journal_editorial_board (section_id)`,
    `create index on journal_editorial_board (journal_id)`,
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

export const name = '202103023155100_journal_editorial_board.mv.ts';
