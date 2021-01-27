import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import {
  REPORTING_TABLES,
  CHECKER_TEAM_EVENTS,
} from 'libs/shared/src/lib/modules/reporting/constants';
import checkerTeamDataView from './CheckerTeamDataView';

class CheckerToTeam extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
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
		${checkerTeamDataView.getViewName()}) c
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
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (team_id)`,
    `create index on ${this.getViewName()} (team_type)`,
    `create index on ${this.getViewName()} (checker_id)`,
    `create index on ${this.getViewName()} (checker_role)`,
    `create index on ${this.getViewName()} (checker_email)`,
  ];

  getViewName(): string {
    return 'checker_to_team';
  }
}

const checkerToTeamView = new CheckerToTeam();
checkerToTeamView.addDependency(checkerTeamDataView);

export default checkerToTeamView;
