-- A1 - With Authors for Revision 
-- added m.editorial_assistant, m.editorial_assistant_email, days_since_editor_decision, recommendation
select 
  m.manuscript_custom_id,
  article_type,
  format_date(submission_date) AS submission_date,
  journal_name,
  days_since(submission_date) AS days_since_submission,
  m.version, m.handling_editor, m.handling_editor_email,
  review_link(submission_id,manuscript_version_id) as review_link,
  m.editorial_assistant,
	m.editorial_assistant_email,
  days_since(last_event_date) as days_since_editor_decision,
  reviews.recommendation
 from manuscripts m 
 left join (select * from (select *, row_number() over (partition by mr.manuscript_custom_id order by mr.submitted_date desc) as rn from manuscript_reviews mr ) s where rn = 1) reviews on reviews.manuscript_custom_id = m.manuscript_custom_id
    where m.last_event_type = 'SubmissionRevisionRequested'
    and final_decision_type is null
order by submission_date