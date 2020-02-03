import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';
import uniqueJournalsView from './UniqueJournals';
import submissionDataView from './SubmissionDataView';

class SubmissionView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT s.submission_id,
    s.manuscript_custom_id,
    s.submission_event,
    s.article_type,
    s.submission_date,
    s.title,
    j.journal_id,
    j.journal_name,
    c.name AS submitting_author_country
    FROM ${submissionDataView.getViewName()} s
      JOIN ${uniqueJournalsView.getViewName()} j ON s.journal_id = j.journal_id
      JOIN countries c ON s.submitting_author_country = c.iso::text
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (journal_id)`
  ];

  getViewName(): string {
    return 'submissions';
  }
}

const submissionView = new SubmissionView();
submissionView.addDependency(uniqueJournalsView);
submissionView.addDependency(submissionDataView);

export default submissionView;
