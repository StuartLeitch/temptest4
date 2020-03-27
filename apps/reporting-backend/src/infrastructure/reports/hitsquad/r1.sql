-- R1 - Reviewers Invited on First Version but no Reports Returned
-- added editorial_assistant, editorial_assistant_email, reviewers_invited_count, reviewers_declined_count, reviewers_accepted_count, days_since_last_reviewer_invited, days_since_last_reviewer_accepted
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
  days_since(m.handling_editor_accepted_date) as days_since_handling_editor_accepted,
  reviewers_invited.count as reviewers_invited_count,
  reviewers_declined.count as reviewers_declined_count,
  reviewers_accepted.count as reviewers_accepted_count,
  days_since(reviewers_invited.max_invited_date) as days_since_last_reviewer_invited,
  days_since(reviewers_accepted.max_accepted_date) as days_since_last_reviewer_accepted
from manuscripts m 
  left join (select manuscript_custom_id, "version", count(*), max(mr.invited_date) as max_invited_date from manuscript_reviewers mr group by manuscript_custom_id, "version") reviewers_invited on m.manuscript_custom_id = reviewers_invited.manuscript_custom_id and m.version = reviewers_invited.version
  left join (select manuscript_custom_id, "version", count(*), max(mr.invited_date) from manuscript_reviewers mr where declined_date is not null group by manuscript_custom_id, "version") reviewers_declined on m.manuscript_custom_id = reviewers_declined.manuscript_custom_id and m.version = reviewers_declined.version
  left join (select manuscript_custom_id, "version", count(*), max(mr.accepted_date) as max_accepted_date from manuscript_reviewers mr where accepted_date is not null group by manuscript_custom_id, "version") reviewers_accepted on m.manuscript_custom_id = reviewers_accepted.manuscript_custom_id and m.version = reviewers_accepted.version
  join (select manuscript_custom_id, version from manuscript_reviewers group by manuscript_custom_id, version) r 
      on r.manuscript_custom_id = m.manuscript_custom_id and r.version = m.version
  left join (
      select manuscript_custom_id, version from manuscript_reviews group by manuscript_custom_id, version
  ) reviews
      on reviews.manuscript_custom_id = m.manuscript_custom_id and reviews."version" = m."version" 
  where m.final_decision_type is null and reviews.version is null