import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class UsersDataView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
as (WITH identities AS (
	SELECT
		ue.payload ->> 'id' AS unique_id,
		time AS event_timestamp,
		ue.id AS event_id,
		identity_view.* AS unique_id
	FROM
		${REPORTING_TABLES.USER} ue,
		jsonb_to_recordset(ue.payload -> 'identities') AS identity_view (TYPE text,
			identifier text,
			email text)
)
SELECT
	local_identity.event_id,
  local_identity.event_timestamp,
  local_identity.email,
	local_identity.unique_id,
	orcid_identity.identifier AS orcid
FROM (
	SELECT
		*
	FROM
		identities
	WHERE
		TYPE = 'local') AS local_identity
	LEFT JOIN (
		SELECT
			*
		FROM
			identities
		WHERE
			TYPE = 'orcid') AS orcid_identity ON local_identity.unique_id = orcid_identity.unique_id)
WITH DATA;
    `;
  }

  postCreateQueries = [
    `CREATE INDEX ON ${this.getViewName()} USING btree (email)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (orcid)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (email, orcid)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (event_id)`,
    `CREATE INDEX ON ${this.getViewName()} USING btree (event_timestamp)`,
  ];

  getViewName(): string {
    return 'users_data';
  }
}

const usersDataView = new UsersDataView();

export default usersDataView;
