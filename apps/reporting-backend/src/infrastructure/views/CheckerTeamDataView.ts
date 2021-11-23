import { AbstractEventView, EventViewContract } from './contracts/EventViewContract';
import { CHECKER_TEAM_EVENTS, REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const checkerTeamEvents = CHECKER_TEAM_EVENTS.map((e) => `'${e}'`);

class CheckerTeamData extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
    ce.id AS event_id,
    coalesce(ce."time", cast_to_timestamp(checker_team_view.updated), cast_to_timestamp('1980-01-01')) AS event_timestamp,
    ce."type" AS event,
    checker_team_view.id as team_id,
    checker_team_view.name as team_name,
    checker_team_view.type as team_type
  FROM
    ${REPORTING_TABLES.CHECKER} ce,
    jsonb_to_record(ce.payload) AS checker_team_view (
      name text,
      "type" text,
      updated text,
      id text
    )
  WHERE
    ce."type" in (${checkerTeamEvents.join(',')})
WITH NO DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event)`,
    `create index on ${this.getViewName()} (event, event_timestamp)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (team_id)`,
    `create index on ${this.getViewName()} (team_type)`,
  ];

  getViewName(): string {
    return 'checker_team_data';
  }
}

const checkerTeamDataView = new CheckerTeamData();

export default checkerTeamDataView;
