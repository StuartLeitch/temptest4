import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscript_reviewers');
  let queryStart = new Date();

  //* manuscript_reviewers dependant on submissions

  const submissionsViewName = 'submissions';

  await knex.raw(`
CREATE MATERIALIZED VIEW IF NOT EXISTS manuscript_reviewers
AS select se.manuscript_custom_id as "manuscript_custom_id",
  se.journal_name,
  se.section_name,
  se.special_issue_name,
  se.special_issue_id,
  manuscripts->>'version' as "version",
  reviewer_view.email as "email",
  reviewer_view.id as "reviewer_id",
  cast_to_timestamp(reviewer_view.responded) as "responded_date",
  reviewer_view."fromService" as from_service,
  cast_to_timestamp(reviewer_view."expiredDate") as expired_date,
  cast_to_timestamp(reviewer_view."invitedDate") as invited_date,
  cast_to_timestamp(reviewer_view."acceptedDate") as accepted_date,
  cast_to_timestamp(reviewer_view."declinedDate") as declined_date,
  reviewer_view.status as "status",
  reviewer_view."aff" as "aff",
  reviewer_view.country as "country",
  reviewer_view."userId" as user_id,
  reviewer_view."givenNames" as given_names,
  reviewer_view."surname" as "surname",
  cast_to_timestamp(reviewer_view.created) as "created_date",
  cast_to_timestamp(reviewer_view.updated) as "updated_date",
  event_id from (select s.*, se.payload
from ${REPORTING_TABLES.SUBMISSION} se	
  join ${submissionsViewName} s on se.id = s.event_id) se,
  jsonb_array_elements(se.payload->'manuscripts') manuscripts,
  jsonb_to_recordset(manuscripts->'reviewers') as reviewer_view(
    id text,
    email text,
    "fromService" text,
    "expiredDate" text,
    "invitedDate" text,
    "acceptedDate" text,
    "declinedDate" text,
    country text,
    "userId" text,
    "givenNames" text,
    surname text,
    aff text,
    created text,
    updated text,
    responded text,
    status text
  ) 
WITH NO DATA;
`);

  const postCreateQueries = [
    `create index on manuscript_reviewers (manuscript_custom_id)`,
    `create index on manuscript_reviewers (manuscript_custom_id, version)`,
    `create index on manuscript_reviewers (version)`,
    `create index on manuscript_reviewers (reviewer_id)`,
    `create index on manuscript_reviewers (responded_date)`,
    `create index on manuscript_reviewers (created_date)`,
    `create index on manuscript_reviewers (expired_date)`,
    `create index on manuscript_reviewers (invited_date)`,
    `create index on manuscript_reviewers (accepted_date)`,
    `create index on manuscript_reviewers (declined_date)`,
    `create index on manuscript_reviewers (status)`,
    `create index on manuscript_reviewers (email)`,
    `create index on manuscript_reviewers (user_id)`,
    `create index on manuscript_reviewers (event_id)`,
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

export const name = '20210323181823_create_manuscript_reviewers_mv.ts';
