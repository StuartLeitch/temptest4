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
AS SELECT 
  t.submission_id,
  t.manuscript_custom_id,
  t.submission_event,
  t.article_type,
  t.submission_date,
  t.title,
  t.journal_id,
  t.journal_name,
  t.submitting_author_country
FROM (
  SELECT
  sd.*,
      row_number() over(partition by sd.manuscript_custom_id order by submission_date desc) as rn
  from
    (SELECT s.submission_id,
      s.manuscript_custom_id,
      s.submission_event,
      s.article_type,
      s.submission_date,
      s.title,
      j.journal_id,
      j.journal_name,
      c.name AS submitting_author_country
      FROM ${submissionDataView.getViewName()} s
      LEFT JOIN ${uniqueJournalsView.getViewName()} j ON s.journal_id = j.journal_id
      LEFT JOIN countries c ON UPPER(s.submitting_author_country) = c.iso
      WHERE s.manuscript_custom_id is not null
    ) sd
) t
WHERE t.rn = 1
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
