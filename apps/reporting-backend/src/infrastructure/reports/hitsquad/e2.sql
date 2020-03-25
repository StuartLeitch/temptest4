-- E2 - Academic Editor/s invited but no Accepted Academic Editor
-- added triage_editor, triage_editor_email, handling_editor, handling_editor_email, days_since_screening_approval, invited_editors_count, declined_editors_count, days_since_last_editor_invite
SELECT
	m.manuscript_custom_id,
	article_type,
	format_date(submission_date) AS submission_date,
	journal_name,
	editorial_assistant,
	editorial_assistant_email,
  triage_editor,
  triage_editor_email,
  handling_editor as invited_handling_editor,
  handling_editor_email as invited_handling_editor_email,
  coalesce(m_editors.count, 0) as invited_editors_count,
  days_since(m_editors.max) as days_since_last_editor_invite,
  coalesce(m_declined_editors.count, 0) as declined_editors_count,
	days_since(submission_date) AS days_since_submission,
  days_since(s.screening_passed_date) AS days_since_screening_approval,
	review_link(m.submission_id, manuscript_version_id) as review_link
FROM
	manuscripts m
JOIN
  (select submission_id, max(event_timestamp) as screening_passed_date from submission_data s where submission_event = 'SubmissionScreeningPassed' group by submission_id ) s on s.submission_id = m.submission_id
LEFT JOIN
  (select me.manuscript_custom_id, me.role_type, count(*), max(invited_date) from manuscript_editors me where role_type = 'academicEditor' group by me.manuscript_custom_id, me.role_type) m_editors on m_editors.manuscript_custom_id = m.manuscript_custom_id
LEFT JOIN
  (select me.manuscript_custom_id, me.role_type, count(*), max(invited_date) from manuscript_editors me where role_type = 'academicEditor' and me.declined_date is not null group by me.manuscript_custom_id, me.role_type) m_declined_editors on m_declined_editors.manuscript_custom_id = m.manuscript_custom_id
WHERE
	m.final_decision_date IS NULL
	and final_decision_type is null
	AND m.manuscript_custom_id in( SELECT DISTINCT
			manuscript_custom_id FROM (
				SELECT
					*, row_number() OVER (PARTITION BY manuscript_custom_id ORDER BY invited_date DESC) AS rn FROM manuscript_editors me
				WHERE
					me.invited_date IS NOT NULL
					AND coalesce(me.accepted_date, me.declined_date) IS NULL
					AND removed_date IS NULL
					AND role_type = 'academicEditor') e
			WHERE
				e.rn = 1)
