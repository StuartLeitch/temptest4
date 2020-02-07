import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract
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
  editor_view.country as "country",
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
    `create index on ${this.getViewName()} (email)`,
    `create index on ${this.getViewName()} (user_id)`,
    `create index on ${this.getViewName()} (role_type)`,
    `create index on ${this.getViewName()} (event_id)`
  ];

  getViewName(): string {
    return 'manuscript_editors';
  }
}

const manuscriptEditorsView = new ManuscriptEditorsView();
manuscriptEditorsView.addDependency(submissionView);

export default manuscriptEditorsView;
