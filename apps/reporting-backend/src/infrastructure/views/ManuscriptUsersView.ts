import authorsView from './AuthorsView';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import manuscriptEditorsView from './ManuscriptEditorsView';
import manuscriptReviewers from './ManuscriptReviewersView';
import manuscriptsView from './ManuscriptsView';
import usersDataView from './UsersDataView';

class ManuscriptsUsersView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
  users.*,
  user_identities.orcid,
  m.submission_id,
  m.manuscript_version_id,
  m.journal_name,
  m.special_issue_custom_id,
  m.submission_date
  FROM (
    SELECT
      manuscript_custom_id,
      email,
      a.given_names,
      a.surname,
      'active' AS status,
      'author' AS ROLE
    FROM
      ${authorsView.getViewName()} a
    UNION
    SELECT
      manuscript_custom_id,
      email,
      me.given_names,
      me.surname,
      status,
      role_type
    FROM
      ${manuscriptEditorsView.getViewName()} me
    UNION
    SELECT
      manuscript_custom_id,
      email,
      mr.given_names,
      mr.surname,
      status,
      'reviewer' AS ROLE
    FROM
      ${manuscriptReviewers.getViewName()} mr) AS users
  JOIN ${manuscriptsView.getViewName()} m ON m.manuscript_custom_id = users.manuscript_custom_id
  LEFT JOIN LATERAL ( select * from ${usersDataView.getViewName()} where email = users.email and orcid is not null limit 1) user_identities ON user_identities.email = users.email
WITH DATA;`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (submission_date desc)`,
    `create index on ${this.getViewName()} (email)`,
    `create index on ${this.getViewName()} (status)`,
    `create index on ${this.getViewName()} (role)`,
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (manuscript_version_id)`,
    `create index on ${this.getViewName()} (journal_name)`,
    `create index on ${this.getViewName()} (special_issue_custom_id)`,
  ];

  getViewName(): string {
    return 'manuscript_users';
  }
}

const manuscriptsUsersView = new ManuscriptsUsersView();

manuscriptsUsersView.addDependency(authorsView);
manuscriptsUsersView.addDependency(manuscriptEditorsView);
manuscriptsUsersView.addDependency(manuscriptReviewers);
manuscriptsUsersView.addDependency(manuscriptsView);

export default manuscriptsUsersView;
