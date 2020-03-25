-- s2 RTD’d Manuscripts
-- added screener_name, screener_email

SELECT
	manuscript_custom_id,
	article_type,
	editorial_assistant,
	editorial_assistant_email,
	format_date(submission_Date) AS submission_date,
	journal_name,
	days_since(submission_date) AS days_since_submission,
	days_since(last_event_date) AS days_since_RTD,
	'<a href="https://review.hindawi.com/details/' || submission_id || '/' || manuscript_version_id || '">Review link</a>' AS review_link,
	format_date(last_event_date) AS returned_to_draft_date,
  screener_name,
  screener_email
FROM
	manuscripts
WHERE
	last_event_type = 'SubmissionScreeningReturnedToDraft' and final_decision_type is null
ORDER BY
	Days_Since_RTD DESC