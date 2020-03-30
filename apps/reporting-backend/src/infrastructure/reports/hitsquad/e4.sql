-- E4 - At least one Report submitted but no Recommendation from Academic Editor
-- added editorial_assistant, editorial_assistant_email, reviewers_invited_count, reviewers_accepted_with_no_submissions, review_reports_count, last_review_report_date, days_since_handling_editor_accepted, last_reviewer_invite_date, days_since_last_reviewer_invited
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
  reviewers_accepted_no_sub.count as reviewers_accepted_with_no_submissions,
  reviews.review_reports_submitted as review_reports_count,
  days_since(reviews.last_review_submission_date) as days_since_last_review_report,
  days_since(m.handling_editor_accepted_date) as days_since_handling_editor_accepted,
  days_since(reviewers_invited.max_invited_date) as days_since_last_reviewer_invited
 from manuscripts m 
    left join (select manuscript_custom_id, "version", count(*), max(mr.invited_date) as max_invited_date from manuscript_reviewers mr group by manuscript_custom_id, "version") reviewers_invited on m.manuscript_custom_id = reviewers_invited.manuscript_custom_id and m.version = reviewers_invited.version
    left join (select manuscript_custom_id, "version", count(*) as review_reports_submitted, max(mr.submitted_date) last_review_submission_date from manuscript_reviews mr group by manuscript_custom_id, "version") reviews on reviews.manuscript_custom_id = m.manuscript_custom_id and m.version = reviews.version
    left join (select mr.manuscript_custom_id, mr.version, count(*) from manuscript_reviewers mr 
      left join manuscript_reviews reviews on reviews.team_member_id = mr.reviewer_id
      where mr.accepted_date is not null and reviews.team_member_id is null
      group by mr.manuscript_custom_id, mr.version) reviewers_accepted_no_sub on m.manuscript_custom_id = reviewers_accepted_no_sub.manuscript_custom_id and reviewers_accepted_no_sub.version = m.version
    left join (select manuscript_custom_id, count(*) as decisions_made from submission_data sd 
        where sd.submission_event in ('SubmissionAccepted', 'SubmissionRejected', 'SubmissionRecommendationToPublishMade', 'SubmissionRecommendationToRejectMade')
        group by manuscript_custom_id
    ) editor_responses on editor_responses.manuscript_custom_id = m.manuscript_custom_id 
    where m.final_decision_type is null and m.last_event_type = 'SubmissionReviewerReportSubmitted'
