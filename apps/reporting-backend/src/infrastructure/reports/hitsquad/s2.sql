-- s2 RTD’d Manuscripts
-- added screener_name, screener_email, editorial_assistant, editorial_assistant_email, screening_link

SELECT
	manuscript_custom_id,
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
  screener_name,
  screener_email
FROM
	manuscripts
WHERE
	last_event_type = 'SubmissionScreeningReturnedToDraft' and final_decision_type is null
ORDER BY
	Days_Since_RTD DESC