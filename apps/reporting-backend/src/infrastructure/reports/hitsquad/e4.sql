-- E4 - At least one Report submitted but no Recommendation from Academic Editor
-- added editorial_assistant, editorial_assistant_email, reviewers_invited_count
select 
  m.manuscript_custom_id,
  m.article_type,
  format_date(submission_date) AS submission_date,
  m.journal_name,
  days_since(submission_date) AS days_since_submission,
  m.version, m.handling_editor, m.handling_editor_email,
  review_link(submission_id,manuscript_version_id) as review_link,
  m.editorial_assistant,
	m.editorial_assistant_email,
  reviewers_invited.count as reviewers_invited_count,
 from manuscripts m 
    left join (select manuscript_custom_id, "version", count(*), max(mr.invited_date) as max_invited_date from manuscript_reviewers mr group by manuscript_custom_id, "version") reviewers_invited on m.manuscript_custom_id = reviewers_invited.manuscript_custom_id and m.version = reviewers_invited.version
    left join mts_manuscript_details mts on mts.manuscript_custom_id = m.manuscript_custom_id
    left join (select manuscript_custom_id, count(*) as decisions_made from submission_data sd 
        where sd.submission_event in ('SubmissionAccepted', 'SubmissionRejected', 'SubmissionRecommendationToPublishMade', 'SubmissionRecommendationToRejectMade')
        group by manuscript_custom_id
    ) editor_responses on editor_responses.manuscript_custom_id = m.manuscript_custom_id 
    where m.final_decision_type is null and m.last_event_type = 'SubmissionReviewerReportSubmitted'
