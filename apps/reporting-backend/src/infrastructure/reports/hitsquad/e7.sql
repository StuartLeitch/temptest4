-- E7 - At least one Report submitted on Revised Version but no Recommendation from Academic Editor
-- added editorial_assistant, reviewers_invited_count, reviewers_accepted_with_no_submissions, review_reports_count, editorial_assistant_email, days_since_current_version_submission

select 
  m.manuscript_custom_id,
  article_type,
  format_date(submission_date) AS submission_date,
  journal_name,
  days_since(submission_date) AS days_since_submission,
  m.version, m.handling_editor, m.handling_editor_email,
  m.editorial_assistant,
	m.editorial_assistant_email,
  reviewers_accepted_no_sub.count as reviewers_accepted_with_no_submissions,
  reviewers_invited.count as reviewers_invited_count,
  reviews.review_reports_submitted as review_reports_count,
  days_since(coalesce(m.resubmission_date, m.submission_date)) as days_since_current_version_submission,
  review_link(m.submission_id,m.manuscript_version_id) as review_link,
  days_since(reviews.last_review_submission_date) as days_since_last_review_report,
  days_since(reviewers_invited.max_invited_date) as days_since_last_reviewer_invited
from manuscripts m 
left join (select mr.manuscript_custom_id, mr.version, count(*) from manuscript_reviewers mr 
      left join manuscript_reviews reviews on reviews.team_member_id = mr.reviewer_id
      where mr.accepted_date is not null and reviews.team_member_id is null
      group by mr.manuscript_custom_id, mr.version) reviewers_accepted_no_sub on m.manuscript_custom_id = reviewers_accepted_no_sub.manuscript_custom_id and reviewers_accepted_no_sub.version = m.version  
left join (select manuscript_custom_id, "version", count(*), max(mr.invited_date) as max_invited_date from manuscript_reviewers mr group by manuscript_custom_id, "version") reviewers_invited on m.manuscript_custom_id = reviewers_invited.manuscript_custom_id and m.version = reviewers_invited.version
left join (select manuscript_custom_id, "version", count(*) as review_reports_submitted, max(mr.submitted_date) last_review_submission_date from manuscript_reviews mr group by manuscript_custom_id, "version") reviews on reviews.manuscript_custom_id = m.manuscript_custom_id and m.version = reviews.version
    where  m.version > '1'
    and final_decision_type is null
    AND m.last_event_type = 'SubmissionReviewerReportSubmitted'
order by submission_date
