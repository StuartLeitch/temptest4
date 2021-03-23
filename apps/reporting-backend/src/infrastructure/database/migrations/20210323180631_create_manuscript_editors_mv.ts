import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscript_editors');
  let queryStart = new Date();

  // * manuscript_editors is dependant on: submissions

  const submissionsViewName = 'submissions';

  await knex.raw(`
CREATE MATERIALIZED VIEW IF NOT EXISTS manuscript_editors
AS SELECT
  editor_view.id as "id",
  se.manuscript_custom_id as "manuscript_custom_id",
  se.journal_name,
  se.section_name,
  se.special_issue_name,
  se.special_issue_id,
  editor_view.email as "email",
  cast_to_timestamp(editor_view."expiredDate") as expired_date,
  cast_to_timestamp(editor_view."invitedDate") as invited_date,
  cast_to_timestamp(editor_view."removedDate") as removed_date,
  cast_to_timestamp(editor_view."acceptedDate") as accepted_date,
  cast_to_timestamp(editor_view."assignedDate") as assigned_date,
  cast_to_timestamp(editor_view."declinedDate") as declined_date,
  editor_view.country as "country",
  editor_view.status as "status",
  editor_view."isCorresponding" as is_corresponding,
  editor_view."userId" as user_id,
  editor_view."givenNames" as given_names,
  editor_view."surname" as "surname",
  editor_view."aff" as "aff",
  editor_view."role"->>'type' as role_type,
  editor_view."role"->>'label' as role_label,
  event_id
  FROM(
    SELECT
      s.last_version_index,
      se.payload,
      s.event_id,
      s.manuscript_custom_id,
      s.journal_name,
      s.section_name,
      s.special_issue_name,
      s.special_issue_id
    FROM
      ${REPORTING_TABLES.SUBMISSION} se
    JOIN ${submissionsViewName} s on
      s.event_id = se.id) se,
    jsonb_to_recordset(((se.payload -> 'manuscripts') -> se.last_version_index) -> 'editors') as editor_view(
      "id" text,
      "expiredDate" text,
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
      role jsonb
    )
WITH NO DATA;
`);

  const postCreateQueries = [
    `create index on manuscript_editors (id)`,
    `create index on manuscript_editors (manuscript_custom_id)`,
    `create index on manuscript_editors (manuscript_custom_id, invited_date desc, accepted_date desc)`,
    `create index on manuscript_editors (manuscript_custom_id, role_type)`,
    `create index on manuscript_editors (manuscript_custom_id, role_type, status)`,
    `create index on manuscript_editors (assigned_date)`,
    `create index on manuscript_editors (invited_date)`,
    `create index on manuscript_editors (manuscript_custom_id, invited_date)`,
    `create index on manuscript_editors (removed_date)`,
    `create index on manuscript_editors (status)`,
    `create index on manuscript_editors (accepted_date)`,
    `create index on manuscript_editors (assigned_date)`,
    `create index on manuscript_editors (declined_date)`,
    `create index on manuscript_editors (email)`,
    `create index on manuscript_editors (user_id)`,
    `create index on manuscript_editors (role_type)`,
    `create index on manuscript_editors (event_id)`,
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
    `Creating table and indices manuscript_editors took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323180631_create_manuscript_editors.mv.ts';
