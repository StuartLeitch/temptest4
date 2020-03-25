-- E1 - No Academic Editor Invited
-- added days_since_screening_approval, triage_editor, triage_editor_email,

SELECT
	manuscript_custom_id,
	article_type,
	format_date(submission_date) AS submission_date,
	journal_name,
	editorial_assistant,
	editorial_assistant_email,
  triage_editor,
  triage_editor_email,
	days_since(submission_date) AS days_since_submission,
  days_since(last_event_date) AS days_since_screening_approval,
	review_link(submission_id,manuscript_version_id) as review_link
FROM
	manuscripts m
WHERE
	m.handling_editor_email IS NULL
	AND last_event_type = 'SubmissionScreeningPassed'
	and final_decision_type is null
ORDER BY
	Days_Since_Submission DESC