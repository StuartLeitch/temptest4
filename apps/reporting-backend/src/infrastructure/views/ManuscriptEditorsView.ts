import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import submissionView from './SubmissionsView';

class ManuscriptEditorsView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
  se.manuscript_custom_id as "manuscript_custom_id",
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
      s.manuscript_custom_id
    FROM
      ${REPORTING_TABLES.SUBMISSION} se
    JOIN ${submissionView.getViewName()} s on
      s.event_id = se.id) se,
    jsonb_to_recordset(((se.payload -> 'manuscripts') -> se.last_version_index) -> 'editors') as editor_view(
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
WITH DATA;
`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, invited_date desc, accepted_date desc)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, role_type)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, role_type, status)`,
    `create index on ${this.getViewName()} (assigned_date)`,
    `create index on ${this.getViewName()} (invited_date)`,
    `create index on ${this.getViewName()} (manuscript_custom_id, invited_date)`,
    `create index on ${this.getViewName()} (removed_date)`,
    `create index on ${this.getViewName()} (status)`,
    `create index on ${this.getViewName()} (accepted_date)`,
    `create index on ${this.getViewName()} (assigned_date)`,
    `create index on ${this.getViewName()} (declined_date)`,
    `create index on ${this.getViewName()} (email)`,
    `create index on ${this.getViewName()} (user_id)`,
    `create index on ${this.getViewName()} (role_type)`,
    `create index on ${this.getViewName()} (event_id)`,
  ];

  getViewName(): string {
    return 'manuscript_editors';
  }
}

const manuscriptEditorsView = new ManuscriptEditorsView();
manuscriptEditorsView.addDependency(submissionView);

export default manuscriptEditorsView;
