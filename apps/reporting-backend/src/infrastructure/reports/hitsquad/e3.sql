-- E3 - Academic Editor Accepted but no Reviewers Invited on First Version
-- added triage_editor, triage_editor_email, editorial_assistant, editorial_assistant_email, invited_editors_count, declined_editors_count, days_since_handling_editor_accepted

SELECT
  m.manuscript_custom_id,
	m.article_type,
	format_date(submission_date) AS submission_date,
	m.journal_name,
	days_since(submission_date) AS days_since_submission,
	review_link(submission_id,manuscript_version_id) as review_link,
	m.handling_editor,
	m.handling_editor_email,
  days_since(m.handling_editor_accepted_date) as days_since_handling_editor_accepted,
  coalesce(m_editors.count, 0) as invited_editors_count,
  coalesce(m_declined_editors.count, 0) as declined_editors_count,
  m.editorial_assistant,
	m.editorial_assistant_email,
  m.triage_editor,
  m.triage_editor_email
FROM
	manuscripts m
	LEFT JOIN manuscript_reviewers r ON r.manuscript_custom_id = m.manuscript_custom_id
	LEFT JOIN mts_manuscript_details mts ON mts.manuscript_custom_id = m.manuscript_custom_id
  LEFT JOIN
  (select me.manuscript_custom_id, me.role_type, count(*), max(invited_date) from manuscript_editors me where role_type = 'academicEditor' group by me.manuscript_custom_id, me.role_type) m_editors on m_editors.manuscript_custom_id = m.manuscript_custom_id
  LEFT JOIN
    (select me.manuscript_custom_id, me.role_type, count(*), max(invited_date) from manuscript_editors me where role_type = 'academicEditor' and me.declined_date is not null group by me.manuscript_custom_id, me.role_type) m_declined_editors on m_declined_editors.manuscript_custom_id = m.manuscript_custom_id
WHERE
	r.manuscript_custom_id IS NULL
	AND m.version = '1'
	AND m.final_decision_type IS NULL
	AND m.last_event_type NOT LIKE 'SubmissionQualityCheck%'
	AND m.handling_editor_email IS NOT NULL
	and(mts.reviewers_invited = 0
		OR mts.reviewers_invited IS NULL)
order by submission_Date