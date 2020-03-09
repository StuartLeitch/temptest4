import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import {
  REPORTING_TABLES,
  CHECKER_TEAM_EVENTS
} from 'libs/shared/src/lib/modules/reporting/constants';

const checkerTeamEvents = CHECKER_TEAM_EVENTS.map(e => `'${e}'`);

class CheckerTeamData extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
    ce.id AS event_id,
    ce."time" AS event_timesampt,
    ce."type" AS event,
    checker_team_view.id as team_id,
    checker_team_view.name as team_name,
    checker_team_view.type as team_type	
  FROM
    ${REPORTING_TABLES.CHECKER} ce,
    jsonb_to_record(ce.payload) AS checker_team_view (
      name text,
      "type" text,
      id text
    )
  WHERE
    ce."type" in (${checkerTeamEvents.join(',')})
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`
  ];

  getViewName(): string {
    return 'checker_team_data';
  }
}

const checkerTeamDataView = new CheckerTeamData();

export default checkerTeamDataView;
