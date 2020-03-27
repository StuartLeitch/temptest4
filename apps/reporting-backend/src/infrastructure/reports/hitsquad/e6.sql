-- E6 - Academic Editor Assigned but no Reviewers Invited on Revised Version 
-- added editorial_assistant, editorial_assistant_email, triage_editor, triage_editor_email, days_since_current_version_submission, days_since_handling_editor_accepted, invited_editors_count

SELECT
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
  review_link(m.submission_id,m.manuscript_version_id) as review_link,
  days_since(m.handling_editor_accepted_date) as days_since_handling_editor_accepted,
  days_since(coalesce(m.resubmission_date, m.submission_date)) as days_since_current_version_submission,
  invited_editors.count as invited_editors_count,
  coalesce(declined_editors.count, 0) as declined_editors_count
FROM
  manuscripts m
  left join (select me.manuscript_custom_id, count(*) from manuscript_editors me where role_type = 'academicEditor' group by me.manuscript_custom_id) invited_editors on invited_editors.manuscript_custom_id = m.manuscript_custom_id
  left join (select me.manuscript_custom_id, count(*) from manuscript_editors me where role_type = 'academicEditor' and me.declined_date is not null group by me.manuscript_custom_id) declined_editors on declined_editors.manuscript_custom_id = m.manuscript_custom_id
  LEFT JOIN ( SELECT DISTINCT
      manuscript_custom_id
    FROM
      manuscript_reviewers) r ON m.manuscript_custom_id = r.manuscript_custom_id
  JOIN (
    SELECT
      *
    FROM (
      SELECT
        submission_id,
        sum(editor_count) AS editor_count
      FROM (
        SELECT submission_id, count(*) AS editor_count FROM submission_data sd WHERE submission_event in('SubmissionAcademicEditorAccepted') GROUP BY submission_id
        UNION ALL
        SELECT submission_id, - count(*) AS editor_count FROM submission_data sd WHERE submission_event in('SubmissionAcademicEditorRemoved') GROUP BY submission_id) s
      GROUP BY
        submission_id) s
    ) editor_counts ON m.submission_id = editor_counts.submission_id
  WHERE
    r.manuscript_custom_id IS NULL
    AND version > '1'
    AND editor_counts.editor_count > 0
    AND final_decision_type is null