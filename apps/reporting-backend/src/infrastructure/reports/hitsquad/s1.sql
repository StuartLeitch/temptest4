-- S1 - Manuscripts at Editorial Screening
-- added screener_name, screener_email
SELECT
	manuscript_custom_id,
	article_type,
	format_date(submission_Date) AS submission_date,
	journal_name,
	days_since(submission_date) AS days_since_submission,
  screener_name,
  screener_email,
	review_link(submission_id,manuscript_version_id) as review_link
FROM
	manuscripts
WHERE
	last_event_type = 'SubmissionSubmitted' and final_decision_type is null
ORDER BY
	submission_date		
		