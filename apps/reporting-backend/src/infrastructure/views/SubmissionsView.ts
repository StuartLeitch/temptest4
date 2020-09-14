import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalsView from './JournalsView';
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
  t.apc as journal_apc,
  t.submission_date,
  t.resubmission_date,
  t.screening_passed_date,
  t.last_recommendation_date,
  t.void_date,
  t.is_void,
  t.last_revision_submitted,
  t.last_returned_to_draft_date,
  t.last_returned_to_editor_date,
  t.sent_to_quality_check_date,
  t.sent_to_materials_check_date,
  t.last_materials_check_files_requested_date,
  t.last_materials_check_files_submitted_date,
  t.screening_paused_date,
  t.screening_unpaused_date,
  t.qc_paused_date,
  t.qc_unpaused_date,
  t.qc_escalated_date,
  t.materials_check_files_requested_count,
  t.materials_check_files_submitted_count,
  t.screening_returned_to_draft_count,
  t.accepted_date,
  t.first_decision_date,
  t.special_issue_id,
  t.section_id,
  t.preprint_value,
  t.title,
  t.journal_id,
  t.journal_name,
  t.publisher_name,
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
      screening_passed_dates.max as screening_passed_date,
      recommendation_dates.max as last_recommendation_date,
      screening_draft_dates.max as last_returned_to_draft_date,
      screening_draft_dates.count as screening_returned_to_draft_count,
      returned_to_editor_dates.max as last_returned_to_editor_date,
      revision_dates.max as last_revision_submitted,
      submission_accepted_dates.max as sent_to_quality_check_date,
      peer_review_dates.max as sent_to_materials_check_date,
      revision_requested_dates.min as first_decision_date,
      materials_check_files_requested_dates.max as last_materials_check_files_requested_date,
      materials_check_files_requested_dates.count as materials_check_files_requested_count,
      materials_check_files_submitted_dates.max as last_materials_check_files_submitted_date,
      materials_check_files_submitted_dates.count as materials_check_files_submitted_count,
      paused_dates.max as screening_paused_date,
      unpaused_dates.max as screening_unpaused_date,
      qc_paused_dates.max as qc_paused_date,
      qc_unpaused_dates.max as qc_unpaused_date,
      qc_escalated_dates.max as qc_escalated_date,
      accepted_dates.min as accepted_date,
      void_dates.max as void_date,
      void_dates.max is not null as is_void,
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
      case 
        WHEN s.preprint_value = 'null' then null
        ELSE s.preprint_value
      end preprint_value,
      j.journal_id,
      j.journal_name,
      j.apc,
      j.publisher_name,
      j.journal_code
      FROM ${submissionDataView.getViewName()} s
      LEFT JOIN ${journalsView.getViewName()} j ON s.journal_id = j.journal_id
      JOIN  (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionSubmitted' group by submission_id) submission_submitted_dates on submission_submitted_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionScreeningPassed' group by submission_id) screening_passed_dates on screening_passed_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionAccepted' or submission_event like 'SubmissionRecommendation%' group by submission_id) recommendation_dates on recommendation_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, version, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionRevisionSubmitted' group by submission_id, version) revision_dates on revision_dates.submission_id = s.submission_id and s.version = revision_dates.version
      LEFT JOIN (SELECT submission_id, version, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionScreeningReturnedToDraft' group by submission_id, version) screening_draft_dates on screening_draft_dates.submission_id = s.submission_id and s.version = screening_draft_dates.version
      LEFT JOIN (SELECT submission_id, version, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionReturnedToAcademicEditor' group by submission_id, version) returned_to_editor_dates on returned_to_editor_dates.submission_id = s.submission_id and s.version = returned_to_editor_dates.version
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionAccepted' group by submission_id) submission_accepted_dates on submission_accepted_dates.submission_id = s.submission_id 
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionPeerReviewCycleCheckPassed' group by submission_id) peer_review_dates on peer_review_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionQualityCheckFilesRequested' group by submission_id) materials_check_files_requested_dates on materials_check_files_requested_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionQualityChecksSubmitted' group by submission_id) materials_check_files_submitted_dates on materials_check_files_submitted_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionRevisionRequested' group by submission_id) revision_requested_dates on revision_requested_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp), min(event_timestamp), count(*) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionScreeningVoid' group by submission_id) void_dates on void_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionScreeningPaused' group by submission_id) paused_dates on paused_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionScreeningUnpaused' group by submission_id) unpaused_dates on unpaused_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionQualityCheckPaused' group by submission_id) qc_paused_dates on qc_paused_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionQualityCheckUnpaused' group by submission_id) qc_unpaused_dates on qc_unpaused_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, max(event_timestamp) FROM ${submissionDataView.getViewName()} where submission_event = 'SubmissionQualityCheckEscalated' group by submission_id) qc_escalated_dates on qc_unpaused_dates.submission_id = s.submission_id
      LEFT JOIN (SELECT submission_id, min(event_timestamp) FROM ${submissionDataView.getViewName()} where submission_event in ('SubmissionQualityCheckPassed', 'SubmissionPeerReviewCycleCheckPassed') group by submission_id) accepted_dates on accepted_dates.submission_id = s.submission_id
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
    `create index on ${this.getViewName()} (journal_id)`,
    `create index on ${this.getViewName()} (journal_name)`,
    `create index on ${this.getViewName()} (preprint_value)`,
  ];

  getViewName(): string {
    return 'submissions';
  }
}

const submissionView = new SubmissionView();
submissionView.addDependency(journalsView);

export default submissionView;
