import * as Knex from 'knex';
import JournalSpecialIssuesView from '../../views/JournalSpecialIssuesView';

const sp_refresh_manuscripts_as_table = `
CREATE OR REPLACE PROCEDURE public.sp_refresh_manuscripts_as_table()
 LANGUAGE plpgsql
AS $procedure$
begin
	raise notice '% START', clock_timestamp();

	DROP TABLE IF EXISTS temp_authors_is_corresponding;
	CREATE TEMP TABLE temp_authors_is_corresponding AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.authors WHERE is_corresponding = true) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_authors_is_corresponding_manuscript_custom_id ON temp_authors_is_corresponding(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_authors_is_submitting;
	CREATE TEMP TABLE temp_authors_is_submitting AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.authors WHERE is_submitting = true) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_authors_is_submitting_manuscript_custom_id ON temp_authors_is_submitting(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_manuscript_editors_triageEditor;
	CREATE TEMP TABLE temp_manuscript_editors_triageEditor AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id ORDER BY status_order, i.assigned_date DESC NULLS LAST) as rn
			FROM (SELECT case when status='active' then 1 when status='accepted' then 2 else 3 end as status_order, * FROM public.manuscript_editors WHERE role_type = 'triageEditor'::text) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_manuscript_editors_triageEditor_manuscript_custom_id ON temp_manuscript_editors_triageEditor(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_manuscript_editors_academicEditor;
	CREATE TEMP TABLE temp_manuscript_editors_academicEditor AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id ORDER BY i.invited_date DESC NULLS LAST, i.accepted_date DESC NULLS LAST, status_order) as rn
		FROM (SELECT case when status='accepted' then 1 when status='pending' then 2 else 3 end as status_order , * FROM public.manuscript_editors 
		WHERE role_type = 'academicEditor'::text and (status in ('accepted', 'pending') or status is null)) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_manuscript_editors_academicEditor_manuscript_custom_id ON temp_manuscript_editors_academicEditor(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_manuscript_editors_editorialAssistant;
	CREATE TEMP TABLE temp_manuscript_editors_editorialAssistant AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id
				order by case when status='active' then 1
				when status='pending' then 2
				when status='removed' then 3
				else 4 end nulls last, assigned_date desc nulls last) as rn
			FROM (SELECT * FROM public.manuscript_editors WHERE role_type = 'editorialAssistant'::text) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_manuscript_editors_Assistant_man_cust_id ON temp_manuscript_editors_editorialAssistant(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_journal_sections;
	CREATE TEMP TABLE temp_journal_sections AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.section_id) as rn
			FROM public.journal_sections i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_journal_sections_section_id ON temp_journal_sections(section_id);

	DROP TABLE IF EXISTS temp_journal_special_issues;
	CREATE TEMP TABLE temp_journal_special_issues AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.special_issue_id) as rn
			FROM public.journal_special_issues i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_journal_special_issues_special_issue_id ON temp_journal_special_issues(special_issue_id);
	
	DROP TABLE IF EXISTS temp_MostRecentInvoices;
	CREATE TEMP TABLE temp_MostRecentInvoices AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id ORDER BY i.invoice_created_date DESC NULLS LAST) as rn
			FROM public.invoices i
		where i.is_credit_note = false) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_MostRecentInvoices_manuscript_custom_id ON temp_MostRecentInvoices(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_MostRecentSubmissions;
	CREATE TEMP TABLE temp_MostRecentSubmissions AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.submission_data WHERE
				 submission_event::text = ANY (ARRAY['SubmissionQualityCheckPassed'::character varying::text, 'SubmissionWithdrawn'::character varying::text, 'SubmissionScreeningRTCd'::character varying::text, 'SubmissionQualityCheckRTCd'::character varying::text, 'SubmissionRejected'::character varying::text, 'SubmissionScreeningVoid'::character varying::text])
			) s) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_MostRecentSubmissions_submission_id ON temp_MostRecentSubmissions(submission_id);

	DROP TABLE IF EXISTS temp_MostRecentSubmissions2;
	CREATE TEMP TABLE temp_MostRecentSubmissions2 AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.submission_data WHERE
				 submission_event::text = ANY (ARRAY['SubmissionSubmitted'::character varying::text, 'SubmissionScreeningReturnedToDraft'::character varying::text, 'SubmissionScreeningRTCd'::character varying::text, 'SubmissionScreeningVoid'::character varying::text, 'SubmissionScreeningPassed'::character varying::text, 'SubmissionAcademicEditorInvited'::character varying::text, 'SubmissionAcademicEditorAccepted'::character varying::text, 'SubmissionReviewerInvited'::character varying::text, 'SubmissionReviewerReportSubmitted'::character varying::text, 'SubmissionRevisionRequested'::character varying::text, 'SubmissionRevisionSubmitted'::character varying::text, 'SubmissionRecommendationToPublishMade'::character varying::text, 'SubmissionRecommendationToRejectMade'::character varying::text, 'SubmissionRejected'::character varying::text, 'SubmissionAccepted'::character varying::text, 'SubmissionQualityCheckRTCd'::character varying::text, 'SubmissionQualityCheckPassed'::character varying::text, 'SubmissionWithdrawn'::character varying::text])
			) s) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_MostRecentSubmissions2_submission_id ON temp_MostRecentSubmissions2(submission_id);

	DROP TABLE IF EXISTS temp_checker_to_submission_screener;
	CREATE TEMP TABLE temp_checker_to_submission_screener AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.checker_to_submission WHERE checker_role = 'screener'::text) s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_checker_to_submission_screener_submission_id ON temp_checker_to_submission_screener(submission_id);

	DROP TABLE IF EXISTS temp_checker_to_submission_qualityChecker;
	CREATE TEMP TABLE temp_checker_to_submission_qualityChecker AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.checker_to_submission WHERE checker_role = 'qualityChecker'::text) s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_checker_to_submission_qualityChecker_submission_id ON temp_checker_to_submission_qualityChecker(submission_id);

	DROP TABLE IF EXISTS temp_manuscript_reviews_editor;
	CREATE TEMP TABLE temp_manuscript_reviews_editor AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.manuscript_custom_id ORDER BY s.submitted_date DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.manuscript_reviews WHERE team_type = 'editor'::text) s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_manuscript_reviews_editor_manuscript_custom_id ON temp_manuscript_reviews_editor(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_article_data;
	CREATE TEMP TABLE temp_article_data AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.manuscript_custom_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM public.article_data s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_article_data_manuscript_custom_id ON temp_article_data(manuscript_custom_id);

	--DROP TABLE IF EXISTS public._manuscripts;
	--CREATE TABLE public._manuscripts AS
	 TRUNCATE TABLE public._manuscripts;
	 INSERT INTO public._manuscripts
	 SELECT m.event_id,
		m.event_timestamp,
		m.submission_id,
		m.manuscript_custom_id,
		m.submission_event,
		m.article_type,
		m.version,
		m.manuscript_version_id,
		m.title,
		m.last_version_index,
		m.special_issue_id,
		m.section_id,
		m.submission_date,
		m.screening_passed_date,
		m.last_recommendation_date,
		m.last_returned_to_draft_date,
		m.screening_returned_to_draft_count::bigint,
		m.last_returned_to_editor_date,
		m.last_revision_submitted,
		m.sent_to_quality_check_date,
		m.sent_to_materials_check_date,
		m.first_decision_date,
		m.last_materials_check_files_requested_date,
		m.materials_check_files_requested_count,
		m.last_materials_check_files_submitted_date,
		m.materials_check_files_submitted_count,
		m.screening_paused_date,
		m.screening_unpaused_date,
		m.qc_paused_date,
		m.qc_unpaused_date,
		m.qc_escalated_date,
		m.peer_review_cycle_check_date,
		m.accepted_date,
		m.void_date,
		m.is_void,
		m.resubmission_date,
		m.section_name,
		m.special_issue_name,
		m.preprint_value,
		m.journal_id,
		m.journal_name,
		m.journal_apc,
		m.publisher_name,
		m.journal_code,
		m.source_journal,
		m.deleted,
		m.last_event_type,
		m.last_event_date,
		m.final_decision_date,
		m.final_decision_type,
		m.apc,
		m.submission_pricing_status,
		m.published_date,
		m.gross_apc,
		m.discount,
		m.net_apc,
		m.paid_amount,
		m.due_amount,
		m.coupons,
		m.waivers,
		m.issue_type,
		m.acceptance_chance,
		m.special_issue,
		m.special_issue_custom_id,
		m.special_issue_open_date,
		m.special_issue_closed_date,
		m.si_lead_guest_editor_name,
		m.si_lead_guest_editor_email,
		m.si_lead_guest_editor_affiliation,
		m.si_lead_guest_editor_country,
		m.si_guest_editor_count,
		m.section,
		m.corresponding_author,
		m.corresponding_author_email,
		m.corresponding_author_country,
		m.corresponding_author_affiliation,
		m.submitting_author,
		m.submitting_author_email,
		m.submitting_author_country,
		m.submitting_author_affiliation,
		m.triage_editor,
		m.triage_editor_email,
		m.triage_editor_country,
		m.triage_editor_affiliation,
		m.handling_editor,
		m.handling_editor_email,
		m.handling_editor_country,
		m.handling_editor_affiliation,
		m.handling_editor_invited_date,
		m.editorial_assistant,
		m.editorial_assistant_email,
		m.editorial_assistant_country,
		m.editorial_assistant_affiliation,
		m.screener_name,
		m.screener_email,
		m.quality_checker_name,
		m.quality_checker_email,
		m.is_paused,
		m.is_quality_check_paused,
		m.invited_reviewers_count,
		m.last_reviewer_invitation_date,
		m.first_reviewer_invitation_date,
		m.reviewer_count,
		m.accepted_reviewers_count,
		m.last_reviewer_accepted_date,
		m.first_reviewer_accepted_date,
		m.pending_reviewers_count,
		m.review_reports_count,
		m.last_review_report_submitted_date,
		m.first_review_report_submitted_date,
		m.invited_handling_editors_count,
		m.last_handling_editor_invited_date,
		m.current_handling_editor_accepted_date,
		m.last_handling_editor_declined_date,
		m.first_handling_editor_invited_date,
		m.first_handling_editor_accepted_date,
		m.last_editor_recommendation,
		m.last_editor_recommendation_submitted_date,
		m.last_requested_revision_date,
			CASE
				WHEN m.event_timestamp IS NULL THEN m.acceptance_chance::double precision * COALESCE(m.net_apc, m.journal_apc::double precision)
				ELSE m.net_apc
			END AS current_expected_revenue,
		m.acceptance_chance::double precision * COALESCE(m.net_apc, m.journal_apc::double precision) AS raw_expected_revenue
	   FROM ( SELECT s.event_id,
				s.event_timestamp,
				s.submission_id,
				s.manuscript_custom_id,
				s.submission_event,
				s.article_type,
				s.version,
				s.manuscript_version_id,
				s.title,
				s.last_version_index,
				s.special_issue_id,
				s.section_id,
				s.submission_date,
				s.screening_passed_date,
				s.last_recommendation_date,
				s.last_returned_to_draft_date,
				s.screening_returned_to_draft_count,
				s.last_returned_to_editor_date,
				s.last_revision_submitted,
				s.sent_to_quality_check_date,
				s.sent_to_materials_check_date,
				s.first_decision_date,
				s.last_materials_check_files_requested_date,
				s.materials_check_files_requested_count,
				s.last_materials_check_files_submitted_date,
				s.materials_check_files_submitted_count,
				s.screening_paused_date,
				s.screening_unpaused_date,
				s.qc_paused_date,
				s.qc_unpaused_date,
				s.qc_escalated_date,
				s.peer_review_cycle_check_date,
				s.accepted_date,
				s.void_date,
				s.is_void,
				s.resubmission_date,
				s.section_name,
				s.special_issue_name,
				s.preprint_value,
				s.journal_id,
				s.journal_name,
				s.journal_apc,
				s.publisher_name,
				s.journal_code,
				s.source_journal,
				deleted_manuscripts.manuscript_custom_id IS NOT NULL AS deleted,
				last_sd.submission_event AS last_event_type,
				last_sd.event_timestamp AS last_event_date,
				sd.event_timestamp AS final_decision_date,
				sd.submission_event AS final_decision_type,
					CASE
						WHEN i.apc IS NOT NULL THEN i.apc
						WHEN s.article_type = ANY (ARRAY['Editorial'::text, 'Corrigendum'::text, 'Erratum'::text, 'Retraction'::text, 'Letter to the Editor'::text]) THEN 'free'::text
						ELSE 'paid'::text
					END AS apc,
					CASE
						WHEN i.submission_pricing_status IS NOT NULL THEN i.submission_pricing_status
						WHEN s.article_type = ANY (ARRAY['Editorial'::text, 'Corrigendum'::text, 'Erratum'::text, 'Retraction'::text, 'Letter to the Editor'::text]) THEN 'non-priced'::text
						ELSE 'priced'::text
					END AS submission_pricing_status,
				article_data.published_date,
				COALESCE(i.gross_apc_value, s.journal_apc::double precision) AS gross_apc,
				i.discount,
				i.net_apc,
				i.paid_amount,
				i.due_amount,
				i.coupons,
				i.waivers,
					CASE
						WHEN s.special_issue_id IS NULL THEN 'regular'::text
						ELSE 'special'::text
					END AS issue_type,
					CASE
						WHEN i.submission_pricing_status IS NULL AND (s.article_type = ANY (ARRAY['Editorial'::text, 'Corrigendum'::text, 'Erratum'::text, 'Retraction'::text, 'Letter to the Editor'::text])) THEN COALESCE(individual_ar.free_rate, avg_rate.journal_rate, individual_ar.journal_rate)
						WHEN i.submission_pricing_status = 'non-priced'::text THEN COALESCE(individual_ar.free_rate, avg_rate.journal_rate, individual_ar.journal_rate)
						WHEN s.special_issue_id IS NULL THEN COALESCE(individual_ar.paid_regular_rate, avg_rate.paid_regular_rate, individual_ar.journal_rate)
						WHEN s.special_issue_id IS NOT NULL THEN COALESCE(individual_ar.paid_special_issue_rate, avg_rate.paid_special_issue_rate, individual_ar.journal_rate)
						ELSE COALESCE(individual_ar.journal_rate, avg_rate.journal_rate)
					END AS acceptance_chance,
				spec.special_issue_name AS special_issue,
				spec.special_issue_custom_id,
				spec.open_date AS special_issue_open_date,
				spec.closed_date AS special_issue_closed_date,
				spec.lead_guest_editor_name AS si_lead_guest_editor_name,
				spec.lead_guest_editor_email AS si_lead_guest_editor_email,
				spec.lead_guest_editor_affiliation AS si_lead_guest_editor_affiliation,
				spec.lead_guest_editor_country AS si_lead_guest_editor_country,
				spec.editor_count AS si_guest_editor_count,
				sec.section_name AS section,
				concat(a.given_names, ' ', a.surname) AS corresponding_author,
				a.email AS corresponding_author_email,
				a.country AS corresponding_author_country,
				a.aff AS corresponding_author_affiliation,
				concat(a2.given_names, ' ', a2.surname) AS submitting_author,
				a2.email AS submitting_author_email,
				a2.country AS submitting_author_country,
				a2.aff AS submitting_author_affiliation,
				concat(e.given_names, ' ', e.surname) AS triage_editor,
				e.email AS triage_editor_email,
				e.country AS triage_editor_country,
				e.aff AS triage_editor_affiliation,
				concat(e2.given_names, ' ', e2.surname) AS handling_editor,
				e2.email AS handling_editor_email,
				e2.country AS handling_editor_country,
				e2.aff AS handling_editor_affiliation,
				e2.invited_date AS handling_editor_invited_date,
				concat(e3.given_names, ' ', e3.surname) AS editorial_assistant,
				e3.email AS editorial_assistant_email,
				e3.country AS editorial_assistant_country,
				e3.aff AS editorial_assistant_affiliation,
				screener.checker_name AS screener_name,
				screener.checker_email AS screener_email,
				quality_checker.checker_name AS quality_checker_name,
				quality_checker.checker_email AS quality_checker_email,
				COALESCE(s.screening_paused_date, '1900-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) > COALESCE(s.screening_unpaused_date, '1901-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) AS is_paused,
				COALESCE(s.qc_paused_date, '1900-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) > COALESCE(s.qc_unpaused_date, '1901-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) AS is_quality_check_paused,
				reviewers.invited_reviewers_count,
				reviewers.last_reviewer_invitation_date,
				reviewers.first_reviewer_invitation_date,
				submitting_reviewers.reviewer_count,
				accepted_reviewers.accepted_reviewers_count,
				accepted_reviewers.last_reviewer_accepted_date,
				accepted_reviewers.first_reviewer_accepted_date,
				pending_reviewers.pending_reviewers_count,
				review_reports.review_reports_count,
				review_reports.last_review_report_submitted_date,
				review_reports.first_review_report_submitted_date,
				handling_editors.invited_handling_editors_count,
				handling_editors.last_handling_editor_invited_date,
				handling_editors.current_handling_editor_accepted_date,
				handling_editors.last_handling_editor_declined_date,
				handling_editors.first_handling_editor_invited_date,
				handling_editors.first_handling_editor_accepted_date,
				last_editor_recommendation.recommendation AS last_editor_recommendation,
				last_editor_recommendation.submitted_date AS last_editor_recommendation_submitted_date,
				submission_revision_requested_dates.max AS last_requested_revision_date
			   FROM public.submissions s

			   LEFT JOIN temp_authors_is_corresponding a ON a.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_authors_is_submitting a2 ON a2.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_manuscript_editors_triageEditor e ON e.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_manuscript_editors_academicEditor e2 ON e2.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_manuscript_editors_editorialAssistant e3 ON e3.manuscript_custom_id = s.manuscript_custom_id 
			   LEFT JOIN temp_journal_sections sec ON sec.section_id = s.section_id
			   LEFT JOIN temp_journal_special_issues spec ON spec.special_issue_id = s.special_issue_id
	------------------------------------------------------------------
			   LEFT JOIN temp_MostRecentInvoices i ON i.manuscript_custom_id = s.manuscript_custom_id 
			   LEFT JOIN temp_MostRecentSubmissions sd ON sd.submission_id = s.submission_id
			   LEFT JOIN temp_MostRecentSubmissions2 last_sd ON last_sd.submission_id = s.submission_id
			   LEFT JOIN ( SELECT submission_data.submission_id,
						max(submission_data.event_timestamp) AS max
					   FROM submission_data
					  WHERE submission_data.submission_event::text = 'SubmissionRevisionRequested'::text
					  GROUP BY submission_data.submission_id) submission_revision_requested_dates ON submission_revision_requested_dates.submission_id = s.submission_id
				 LEFT JOIN temp_checker_to_submission_screener screener ON screener.submission_id = s.submission_id
				 LEFT JOIN temp_checker_to_submission_qualityChecker quality_checker ON quality_checker.submission_id = s.submission_id
				 LEFT JOIN temp_manuscript_reviews_editor last_editor_recommendation ON last_editor_recommendation.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						manuscript_reviewers.version,
						count(*) AS invited_reviewers_count,
						max(manuscript_reviewers.invited_date) AS last_reviewer_invitation_date,
						min(manuscript_reviewers.invited_date) AS first_reviewer_invitation_date
					   FROM public.manuscript_reviewers
					  GROUP BY manuscript_reviewers.manuscript_custom_id, manuscript_reviewers.version) reviewers ON reviewers.manuscript_custom_id = s.manuscript_custom_id AND reviewers.version = s.version
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						count(DISTINCT manuscript_reviewers.email) AS reviewer_count
					   FROM public.manuscript_reviewers
					  WHERE manuscript_reviewers.status = 'submitted'::text
					  GROUP BY manuscript_reviewers.manuscript_custom_id) submitting_reviewers ON submitting_reviewers.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						manuscript_reviewers.version,
						count(*) AS accepted_reviewers_count,
						min(manuscript_reviewers.accepted_date) AS first_reviewer_accepted_date,
						max(manuscript_reviewers.accepted_date) AS last_reviewer_accepted_date
					   FROM public.manuscript_reviewers
					  WHERE manuscript_reviewers.status = 'accepted'::text
					  GROUP BY manuscript_reviewers.manuscript_custom_id, manuscript_reviewers.version) accepted_reviewers ON accepted_reviewers.manuscript_custom_id = s.manuscript_custom_id AND accepted_reviewers.version = s.version
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						manuscript_reviewers.version,
						count(*) AS pending_reviewers_count
					   FROM public.manuscript_reviewers
					  WHERE manuscript_reviewers.responded_date IS NULL
					  GROUP BY manuscript_reviewers.manuscript_custom_id, manuscript_reviewers.version) pending_reviewers ON pending_reviewers.manuscript_custom_id = s.manuscript_custom_id AND pending_reviewers.version = s.version
				 LEFT JOIN ( SELECT manuscript_reviews.manuscript_custom_id,
						manuscript_reviews.version,
						count(*) AS review_reports_count,
						max(manuscript_reviews.submitted_date) AS last_review_report_submitted_date,
						min(manuscript_reviews.submitted_date) AS first_review_report_submitted_date
					   FROM public.manuscript_reviews
					  WHERE manuscript_reviews.recommendation = ANY (ARRAY['publish'::text, 'reject'::text, 'minor'::text, 'major'::text])
					  GROUP BY manuscript_reviews.manuscript_custom_id, manuscript_reviews.version) review_reports ON review_reports.manuscript_custom_id = s.manuscript_custom_id AND review_reports.version = s.version
				 LEFT JOIN ( SELECT manuscript_editors.manuscript_custom_id,
						count(*) AS invited_handling_editors_count,
						min(manuscript_editors.invited_date) AS first_handling_editor_invited_date,
						max(manuscript_editors.invited_date) AS last_handling_editor_invited_date,
						min(manuscript_editors.accepted_date) AS first_handling_editor_accepted_date,
						max(manuscript_editors.accepted_date) AS current_handling_editor_accepted_date,
						max(manuscript_editors.declined_date) AS last_handling_editor_declined_date
					   FROM public.manuscript_editors
					  WHERE manuscript_editors.role_type = 'academicEditor'::text
					  GROUP BY manuscript_editors.manuscript_custom_id) handling_editors ON handling_editors.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN acceptance_rates individual_ar ON individual_ar.month = to_char(s.submission_date, 'YYYY-MM-01'::text)::date AND s.journal_id = individual_ar.journal_id
				 LEFT JOIN ( SELECT acceptance_rates.journal_id,
						avg(acceptance_rates.journal_rate) AS journal_rate,
						avg(acceptance_rates.paid_regular_rate) AS paid_regular_rate,
						avg(acceptance_rates.paid_special_issue_rate) AS paid_special_issue_rate
					   FROM acceptance_rates
					  GROUP BY acceptance_rates.journal_id) avg_rate ON avg_rate.journal_id = s.journal_id
				 LEFT JOIN temp_article_data article_data ON article_data.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN LATERAL ( SELECT d.manuscript_custom_id,
						d.reason
					   FROM deleted_manuscripts d
					  WHERE d.manuscript_custom_id::text = s.manuscript_custom_id
					 LIMIT 1) deleted_manuscripts ON deleted_manuscripts.manuscript_custom_id::text = s.manuscript_custom_id) m;

	DROP TABLE IF EXISTS temp_authors_is_corresponding;
	DROP TABLE IF EXISTS temp_authors_is_submitting;
	DROP TABLE IF EXISTS temp_manuscript_editors_triageEditor;
	DROP TABLE IF EXISTS temp_manuscript_editors_academicEditor;
	DROP TABLE IF EXISTS temp_manuscript_editors_editorialAssistant;
	DROP TABLE IF EXISTS temp_journal_sections;
	DROP TABLE IF EXISTS temp_journal_special_issues;
	DROP TABLE IF EXISTS temp_MostRecentInvoices;
	DROP TABLE IF EXISTS temp_MostRecentSubmissions;
	DROP TABLE IF EXISTS temp_MostRecentSubmissions2;
	DROP TABLE IF EXISTS temp_checker_to_submission_screener;
	DROP TABLE IF EXISTS temp_checker_to_submission_qualityChecker;
	DROP TABLE IF EXISTS temp_manuscript_reviews_editor;
	DROP TABLE IF EXISTS temp_article_data;

	raise notice '% DONE', clock_timestamp();
end;
$procedure$
;
`;

export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(sp_refresh_manuscripts_as_table),
	]);
  }
  
export async function down(knex: Knex): Promise<any> {
	return Promise.all([
        //knex.raw(sp_refresh_manuscripts_as_table_migration_rollback),
      ]);
  }

export const updatedMaterializedViews = 
[
	JournalSpecialIssuesView,
];

export const name = '20220816133600_fix_random_fields_values';
