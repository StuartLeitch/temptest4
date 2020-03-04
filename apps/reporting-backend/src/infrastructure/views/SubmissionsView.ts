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
  t.event_id,
  t.event_timestamp,
  t.submission_id,
  t.version,
  t.manuscript_version_id,
  t.manuscript_custom_id,
  t.submission_event,
  t.article_type,
  t.submission_date,
  t.resubmission_date,
  t.special_issue_id,
  t.section_id,
  t.title,
  t.journal_id,
  t.journal_name,
  t.journal_code,
  t.last_version_index
FROM (
  SELECT
  sd.*,
      row_number() over(partition by sd.manuscript_custom_id order by event_timestamp desc) as rn
  from
    (SELECT s.event_id,
      s.event_timestamp,
      s.submission_id,
      s.manuscript_custom_id,
      s.submission_event,
      submission_submitted_dates.min as submission_date,
      CASE 
        WHEN submission_submitted_dates.count = 1 THEN null
        ELSE submission_submitted_dates.max
      END as resubmission_date,
      s.article_type,
      s.version,
      s.manuscript_version_id,
      s.title,
      s.last_version_index,
      s.special_issue_id,
      s.section_id,
      j.journal_id,
      j.journal_name,
      j.journal_code
      FROM ${submissionDataView.getViewName()} s
      LEFT JOIN ${uniqueJournalsView.getViewName()} j ON s.journal_id = j.journal_id
      JOIN  (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionSubmitted' group by submission_id) submission_submitted_dates on submission_submitted_dates.submission_id = s.submission_id
      WHERE s.manuscript_custom_id is not null
      AND s.submission_event not like 'SubmissionQualityCheck%' and s.submission_event not like 'SubmissionScreening%'
    ) sd
) t
WHERE t.rn = 1
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (submission_id)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (submission_date)`,
    `create index on ${this.getViewName()} (article_type)`,
    `create index on ${this.getViewName()} (journal_id)`
  ];

  getViewName(): string {
    return 'submissions';
  }
}

const submissionView = new SubmissionView();
submissionView.addDependency(uniqueJournalsView);

export default submissionView;
