import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: checker_to_team');
  let queryStart = new Date();

  // * checker_to_team is dependant on checker_team_data

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS checker_to_team
AS
SELECT
	ce.id as checker_id,
	ce."givenNames" || ' ' || ce.surname as checker_name,
	ce."isConfirmed" as is_confirmed,
  ce.email as checker_email,
	CASE WHEN ce.role IS NULL THEN
		'leader'
	ELSE
		ce.role
	END AS checker_role,
	cast_to_timestamp(ce.created) as created_date,
	cast_to_timestamp(ce.updated) as updated_date,
  c.event_id,
  c.event_timestamp,
  c.event,
  c.team_id,
  c.team_name,
  c.team_type
	FROM (
	SELECT
		*,
		row_number() OVER (PARTITION BY team_id ORDER BY event_timestamp DESC) AS rn
	FROM
		checker_team_data) c
	JOIN (
		SELECT
			checker_team_members.*,
			ce.id AS event_id
		FROM
			${REPORTING_TABLES.CHECKER} ce,
			jsonb_to_recordset((ce.payload -> 'checkers')::jsonb || (ce.payload -> 'teamLeaders')::jsonb) AS checker_team_members (
        email text,
				ROLE text,
				id text,
				surname text,
				"givenNames" text,
				"created" text,
				"updated" text,
        "isConfirmed" bool)
      ) ce ON c.event_id = ce.event_id
WHERE
	c.rn = 1
WITH NO DATA;
  `
  );

  const postCreateQueries = [
    `CREATE index on checker_to_team (event_id)`,
    `CREATE index on checker_to_team (event)`,
    `CREATE index on checker_to_team (event_timestamp)`,
    `CREATE index on checker_to_team (team_id)`,
    `CREATE index on checker_to_team (team_type)`,
    `CREATE index on checker_to_team (checker_id)`,
    `CREATE index on checker_to_team (checker_role)`,
    `CREATE index on checker_to_team (checker_email)`,
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
    `Creating table and indices checker_to_team took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323123600_create_checker_to_team.ts';
