import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import {
  REPORTING_TABLES,
  CHECKER_SUBMISSION_EVENTS,
} from 'libs/shared/src/lib/modules/reporting/constants';
import checkerSubmissionData from './CheckerSubmissionDataView';

class CheckerToSubmission
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
	event_id,
	event_timestamp,
	event,
	team_id,
	checker_id,
	submission_id,
	assignation_date,
	checker_name,
	checker_email,
	checker_role,
	is_confirmed
FROM (
	SELECT
		*,
		row_number() OVER (PARTITION BY submission_id, checker_role ORDER BY assignation_date DESC) AS rn
	FROM
		${checkerSubmissionData.getViewName()}) c
WHERE
	c.rn = 1
WITH NO DATA;
    `;
  }

  postCreateQueries = [
    `CREATE index on ${this.getViewName()} (event_id)`,
    `CREATE index on ${this.getViewName()} (event)`,
    `CREATE index on ${this.getViewName()} (event, event_timestamp)`,
    `CREATE index on ${this.getViewName()} (event_timestamp)`,
    `CREATE index on ${this.getViewName()} (submission_id)`,
    `CREATE index on ${this.getViewName()} (checker_id)`,
    `CREATE index on ${this.getViewName()} (team_id)`,
    `CREATE index on ${this.getViewName()} (assignation_date)`,
    `CREATE index on ${this.getViewName()} (submission_id, assignation_date)`,
    `CREATE index on ${this.getViewName()} (checker_role)`,
    `CREATE index on ${this.getViewName()} (checker_email)`,
  ];

  getViewName(): string {
    return 'checker_to_submission';
  }
}
const checkerToSubmissionView = new CheckerToSubmission();
checkerToSubmissionView.addDependency(checkerSubmissionData);

export default checkerToSubmissionView;
