-- S3 - Manuscripts at Quality Checking
select manuscript_custom_id,
	article_type,
	editorial_assistant,
	editorial_assistant_email,
	format_date(submission_date) AS submission_date,
	journal_name,
	days_since(submission_date) AS days_since_submission,
	days_since(last_event_date) AS days_since_RTD,
  review_link(submission_id,manuscript_version_id) as review_link,
  screening_link(manuscript_custom_id),
	format_date(last_event_date) AS returned_to_draft_date,
  quality_checker_name,
  quality_checker_email
 from manuscripts m 
    where m.last_event_type = 'SubmissionAccepted'
    and m.final_decision_type is null