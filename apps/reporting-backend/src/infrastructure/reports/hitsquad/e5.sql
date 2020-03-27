-- E5 - Academic Editor Recommendation made but waiting for Triage Editor Approval 
-- added editorial_assistant, editorial_assistant_email,  triage_editor, triage_editor_email,
select 
  m.manuscript_custom_id,
  article_type,
  format_date(submission_date) AS submission_date,
  m.journal_name,
  days_since(submission_date) AS days_since_submission,
  m.version, m.handling_editor, m.handling_editor_email,
  m.editorial_assistant,
	m.editorial_assistant_email,
  m.triage_editor,
  m.triage_editor_email,
  days_since(last_event_date) as days_since_editor_decision,
  case 
    when m.last_event_type = 'SubmissionRecommendationToPublishMade' then 'accept'
    else 'reject'
  end as recommendation,
  review_link(submission_id,manuscript_version_id) as review_link
from manuscripts m 
    where m.last_event_type in ('SubmissionRecommendationToPublishMade', 'SubmissionRecommendationToRejectMade')
    and final_decision_type is null