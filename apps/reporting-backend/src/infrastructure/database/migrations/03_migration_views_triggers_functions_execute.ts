import * as Knex from 'knex';

const viewsTriggerFunctionsExecute = `
--------------------------------------CREATING _submissions_manuscripts_invoices_as_tables---------------------------------------------------------------------------------------
call public.sp_create_submissions_manuscripts_invoices_as_tables();

call public.sp_log(md5(random()::text || clock_timestamp()::text)::uuid, clock_timestamp(), 'Creating _submissions_manuscripts_invoices_as_tables');

--------------------------------------DROPPING OLD VIEWS---------------------------------------------------------------------------------------
-- dropping existing views and materialized views
call public.drop_all_materialized_views();

call public.sp_log(md5(random()::text || clock_timestamp()::text)::uuid, clock_timestamp(), 'Drop materialized views');

--------------------------------------CREATING MATERIALIZED VIEWS------------------------------------------------------------------------------
-- CREATING MATERIALIZED VIEWS WITH NO DATA
call public.create_materialized_views_no_data();

call public.sp_log(md5(random()::text || clock_timestamp()::text)::uuid, clock_timestamp(), 'Materialized views with no data create end');

commit;

--------------------------------------CREATING VIEWS------------------------------------------------------------------------------
-- CREATING manuscript_vendors VIEWS 

-- View: public.manuscript_vendors

-- DROP VIEW public.manuscript_vendors;

CREATE OR REPLACE VIEW public.manuscript_vendors
 AS
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
    m.screening_returned_to_draft_count,
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
    m.current_expected_revenue,
    m.raw_expected_revenue
   FROM manuscripts m
  WHERE m.final_decision_type IS NULL;

ALTER TABLE public.manuscript_vendors
    OWNER TO postgres;

GRANT ALL ON TABLE public.manuscript_vendors TO postgres;
GRANT SELECT ON TABLE public.manuscript_vendors TO superset_ro;

-- View: public.manuscript_vendors_full_access

-- DROP VIEW public.manuscript_vendors_full_access;

CREATE OR REPLACE VIEW public.manuscript_vendors_full_access
 AS
 SELECT manuscripts.event_id,
    manuscripts.event_timestamp,
    manuscripts.submission_id,
    manuscripts.manuscript_custom_id,
    manuscripts.submission_event,
    manuscripts.article_type,
    manuscripts.version,
    manuscripts.manuscript_version_id,
    manuscripts.title,
    manuscripts.last_version_index,
    manuscripts.special_issue_id,
    manuscripts.section_id,
    manuscripts.submission_date,
    manuscripts.screening_passed_date,
    manuscripts.last_recommendation_date,
    manuscripts.last_returned_to_draft_date,
    manuscripts.screening_returned_to_draft_count,
    manuscripts.last_returned_to_editor_date,
    manuscripts.last_revision_submitted,
    manuscripts.sent_to_quality_check_date,
    manuscripts.sent_to_materials_check_date,
    manuscripts.first_decision_date,
    manuscripts.last_materials_check_files_requested_date,
    manuscripts.materials_check_files_requested_count,
    manuscripts.last_materials_check_files_submitted_date,
    manuscripts.materials_check_files_submitted_count,
    manuscripts.screening_paused_date,
    manuscripts.screening_unpaused_date,
    manuscripts.qc_paused_date,
    manuscripts.qc_unpaused_date,
    manuscripts.qc_escalated_date,
    manuscripts.peer_review_cycle_check_date,
    manuscripts.accepted_date,
    manuscripts.void_date,
    manuscripts.is_void,
    manuscripts.resubmission_date,
    manuscripts.section_name,
    manuscripts.special_issue_name,
    manuscripts.preprint_value,
    manuscripts.journal_id,
    manuscripts.journal_name,
    manuscripts.journal_apc,
    manuscripts.publisher_name,
    manuscripts.journal_code,
    manuscripts.source_journal,
    manuscripts.deleted,
    manuscripts.last_event_type,
    manuscripts.last_event_date,
    manuscripts.final_decision_date,
    manuscripts.final_decision_type,
    manuscripts.apc,
    manuscripts.submission_pricing_status,
    manuscripts.published_date,
    manuscripts.gross_apc,
    manuscripts.discount,
    manuscripts.net_apc,
    manuscripts.paid_amount,
    manuscripts.due_amount,
    manuscripts.coupons,
    manuscripts.waivers,
    manuscripts.issue_type,
    manuscripts.acceptance_chance,
    manuscripts.special_issue,
    manuscripts.special_issue_custom_id,
    manuscripts.special_issue_open_date,
    manuscripts.special_issue_closed_date,
    manuscripts.si_lead_guest_editor_name,
    manuscripts.si_lead_guest_editor_email,
    manuscripts.si_lead_guest_editor_affiliation,
    manuscripts.si_lead_guest_editor_country,
    manuscripts.si_guest_editor_count,
    manuscripts.section,
    manuscripts.corresponding_author,
    manuscripts.corresponding_author_email,
    manuscripts.corresponding_author_country,
    manuscripts.corresponding_author_affiliation,
    manuscripts.submitting_author,
    manuscripts.submitting_author_email,
    manuscripts.submitting_author_country,
    manuscripts.submitting_author_affiliation,
    manuscripts.triage_editor,
    manuscripts.triage_editor_email,
    manuscripts.triage_editor_country,
    manuscripts.triage_editor_affiliation,
    manuscripts.handling_editor,
    manuscripts.handling_editor_email,
    manuscripts.handling_editor_country,
    manuscripts.handling_editor_affiliation,
    manuscripts.handling_editor_invited_date,
    manuscripts.editorial_assistant,
    manuscripts.editorial_assistant_email,
    manuscripts.editorial_assistant_country,
    manuscripts.editorial_assistant_affiliation,
    manuscripts.screener_name,
    manuscripts.screener_email,
    manuscripts.quality_checker_name,
    manuscripts.quality_checker_email,
    manuscripts.is_paused,
    manuscripts.is_quality_check_paused,
    manuscripts.invited_reviewers_count,
    manuscripts.last_reviewer_invitation_date,
    manuscripts.first_reviewer_invitation_date,
    manuscripts.reviewer_count,
    manuscripts.accepted_reviewers_count,
    manuscripts.last_reviewer_accepted_date,
    manuscripts.first_reviewer_accepted_date,
    manuscripts.pending_reviewers_count,
    manuscripts.review_reports_count,
    manuscripts.last_review_report_submitted_date,
    manuscripts.first_review_report_submitted_date,
    manuscripts.invited_handling_editors_count,
    manuscripts.last_handling_editor_invited_date,
    manuscripts.current_handling_editor_accepted_date,
    manuscripts.last_handling_editor_declined_date,
    manuscripts.first_handling_editor_invited_date,
    manuscripts.first_handling_editor_accepted_date,
    manuscripts.last_editor_recommendation,
    manuscripts.last_editor_recommendation_submitted_date,
    manuscripts.last_requested_revision_date,
    manuscripts.current_expected_revenue,
    manuscripts.raw_expected_revenue
   FROM manuscripts;

ALTER TABLE public.manuscript_vendors_full_access
    OWNER TO postgres;

GRANT ALL ON TABLE public.manuscript_vendors_full_access TO postgres;
GRANT SELECT ON TABLE public.manuscript_vendors_full_access TO superset_ro;

call public.sp_log(md5(random()::text || clock_timestamp()::text)::uuid, clock_timestamp(), 'manuscript_vendor views create end');

commit;
`;

export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(viewsTriggerFunctionsExecute),
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
  }

  export const name = '03_migration_views_triggers_functions_execute';
