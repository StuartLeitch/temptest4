import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES, DELETED_MANUSCRIPTS_TABLE } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscripts');
  let queryStart = new Date();

  // * manuscripts is dependant on:
  // * - authors
  // * - invoices
  // * - journal_sections
  // * - journal_special_issues
  // * - submissions
  // * - checker_to_submission
  // * - manuscript_reviewers
  // * - manuscript_reviews
  // * - manuscript_editors
  // * - article_data

  const authorsView = 'authors';
  const invoicesView = 'invoices';
  const journalSectionsView = 'journal_sections';
  const journalSpecialIssuesView = 'journal_special_issues';
  const submissionView = 'submissions';
  const submissionDataView = 'submission_data';
  const checkerToSubmissionView = 'checker_to_submission';
  const manuscriptReviewersView = 'manuscript_reviewers';
  const manuscriptReviewsView = 'manuscript_reviews';
  const manuscriptEditorsView = 'manuscript_editors';
  const articleDataView = 'article_data';
  const acceptanceRatesView = 'acceptance_rates';

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS manuscripts
  AS select
    m.*,
    case
      when m.event_timestamp is null
        then m.acceptance_chance * coalesce(m.net_apc, m.journal_apc::float)
      else m.net_apc
    end as current_expected_revenue,
    m.acceptance_chance * coalesce(m.net_apc, m.journal_apc::float) as raw_expected_revenue
    from (
      SELECT
        s.*,
        deleted_manuscripts.manuscript_custom_id is not null as deleted,
        last_sd.submission_event as last_event_type,
        last_sd.event_timestamp as last_event_date,
        sd.event_timestamp as final_decision_date,
        sd.submission_event as final_decision_type,
        case
          when i.apc is not null then i.apc
          when s.article_type in ('Editorial', 'Corrigendum', 'Erratum', 'Retraction', 'Letter to the Editor') then 'free'
          else 'paid'
        end as apc,
        case
          when i.submission_pricing_status is not null then i.submission_pricing_status
          when s.article_type in ('Editorial', 'Corrigendum', 'Erratum', 'Retraction', 'Letter to the Editor') then 'non-priced'
          else 'priced'
        end as submission_pricing_status,
        article_data.published_date,
        coalesce(i.gross_apc_value, s.journal_apc::float) as gross_apc,
        i.discount,
        i.net_apc,
        i.paid_amount,
        i.due_amount,
        i.coupons,
        i.waivers,
        CASE
          WHEN s.special_issue_id is NULL THEN 'regular'::text
          ELSE 'special'::text
        END AS issue_type,
        case
          when i.submission_pricing_status is null and s.article_type in ('Editorial', 'Corrigendum', 'Erratum', 'Retraction', 'Letter to the Editor')
            then coalesce(individual_ar.free_rate, avg_rate.journal_rate, individual_ar.journal_rate)
          when i.submission_pricing_status = 'non-priced'
            then coalesce(individual_ar.free_rate, avg_rate.journal_rate, individual_ar.journal_rate)
          when s.special_issue_id is NULL
            then coalesce(individual_ar.paid_regular_rate, avg_rate.paid_regular_rate, individual_ar.journal_rate)
          when s.special_issue_id is not NULL
            then coalesce(individual_ar.paid_special_issue_rate, avg_rate.paid_special_issue_rate, individual_ar.journal_rate)
          else coalesce(individual_ar.journal_rate, avg_rate.journal_rate)
        end as acceptance_chance,
        spec.special_issue_name as "special_issue",
        spec.special_issue_custom_id as "special_issue_custom_id",
        spec.open_date as "special_issue_open_date",
        spec.closed_date as "special_issue_closed_date",
        spec.lead_guest_editor_name as "si_lead_guest_editor_name",
        spec.lead_guest_editor_email as "si_lead_guest_editor_email",
        spec.lead_guest_editor_affiliation as "si_lead_guest_editor_affiliation",
        spec.lead_guest_editor_country as "si_lead_guest_editor_country",
        spec.editor_count as "si_guest_editor_count",
        sec.section_name as "section",
        concat(a.given_names, ' ', a.surname) as corresponding_author, a.email as corresponding_author_email, a.country as corresponding_author_country, a.aff as corresponding_author_affiliation,
        concat(a2.given_names, ' ', a2.surname) as submitting_author, a2.email as submitting_author_email, a2.country as submitting_author_country, a2.aff as submitting_author_affiliation,
        concat(e.given_names, ' ', e.surname) as triage_editor, e.email as triage_editor_email, e.country as triage_editor_country, e.aff as triage_editor_affiliation,
        concat(e2.given_names, ' ', e2.surname) as handling_editor, e2.email as handling_editor_email, e2.country as handling_editor_country, e2.aff as handling_editor_affiliation, e2.invited_date as handling_editor_invited_date,
        concat(e3.given_names, ' ', e3.surname) as editorial_assistant, e3.email as editorial_assistant_email, e3.country as editorial_assistant_country, e3.aff as editorial_assistant_affiliation,
        screener.checker_name as screener_name,
        screener.checker_email as screener_email,
        quality_checker.checker_name as quality_checker_name,
        quality_checker.checker_email as quality_checker_email,
        coalesce(s.screening_paused_date, '01-01-1900'::TIMESTAMP) > coalesce(s.screening_unpaused_date, '01-01-1901'::TIMESTAMP) as is_paused,
        coalesce(s.qc_paused_date, '01-01-1900'::TIMESTAMP) > coalesce(s.qc_unpaused_date, '01-01-1901'::TIMESTAMP) as is_quality_check_paused,
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
        last_editor_recommendation.recommendation last_editor_recommendation,
        last_editor_recommendation.submitted_date as last_editor_recommendation_submitted_date,
        submission_revision_requested_dates.max as last_requested_revision_date
      FROM ${submissionView} s
        LEFT JOIN LATERAL (SELECT * FROM ${authorsView} a where a.manuscript_custom_id = s.manuscript_custom_id and a.is_corresponding = true limit 1) a on a.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (SELECT * FROM ${authorsView} a where a.manuscript_custom_id = s.manuscript_custom_id and a.is_submitting = true limit 1) a2 on a2.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView} e where e.manuscript_custom_id = s.manuscript_custom_id and e.role_type = 'triageEditor' limit 1) e on e.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView} e2 where e2.manuscript_custom_id = s.manuscript_custom_id and e2.role_type = 'academicEditor' order by e2.invited_date desc, e2.accepted_date desc limit 1) e2 on e2.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (SELECT * FROM ${manuscriptEditorsView} e3 where e3.manuscript_custom_id = s.manuscript_custom_id and e3.role_type = 'editorialAssistant' limit 1) e3 on e3.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (SELECT * FROM ${journalSectionsView} js where js.section_id = s.section_id limit 1) sec on sec.section_id = s.section_id
        LEFT JOIN LATERAL (SELECT * FROM ${journalSpecialIssuesView} jsi where jsi.special_issue_id = s.special_issue_id limit 1) spec on spec.special_issue_id = s.special_issue_id
        LEFT JOIN LATERAL (SELECT * FROM ${invoicesView} i where i.manuscript_custom_id = s.manuscript_custom_id and i.is_credit_note = false order by i.invoice_created_date desc nulls last limit 1) i on i.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (SELECT * FROM ${submissionDataView} sd where sd.submission_id = s.submission_id and sd.submission_event in ('SubmissionQualityCheckPassed', 'SubmissionWithdrawn', 'SubmissionScreeningRTCd', 'SubmissionQualityCheckRTCd', 'SubmissionRejected', 'SubmissionScreeningVoid')
          order by event_timestamp desc limit 1) sd on sd.submission_id = s.submission_id
        LEFT JOIN LATERAL (SELECT * FROM ${submissionDataView} sd where sd.submission_id = s.submission_id and submission_event in (
          'SubmissionSubmitted', 'SubmissionScreeningReturnedToDraft', 'SubmissionScreeningRTCd', 'SubmissionScreeningVoid', 'SubmissionScreeningPassed', 'SubmissionAcademicEditorInvited',
          'SubmissionAcademicEditorAccepted', 'SubmissionReviewerInvited', 'SubmissionReviewerReportSubmitted', 'SubmissionRevisionRequested', 'SubmissionRevisionSubmitted',
          'SubmissionRecommendationToPublishMade', 'SubmissionRecommendationToRejectMade', 'SubmissionRejected', 'SubmissionAccepted', 'SubmissionQualityCheckRTCd',
          'SubmissionQualityCheckPassed', 'SubmissionWithdrawn'
        ) order by event_timestamp desc limit 1) last_sd on last_sd.submission_id = s.submission_id
        LEFT JOIN (SELECT submission_id, max(event_timestamp) FROM ${submissionDataView} where submission_event = 'SubmissionRevisionRequested' group by submission_id) submission_revision_requested_dates on submission_revision_requested_dates.submission_id = s.submission_id
        LEFT JOIN LATERAL (SELECT * FROM ${checkerToSubmissionView} c where c.submission_id = s.submission_id and c.checker_role = 'screener' limit 1) screener on screener.submission_id = s.submission_id
        LEFT JOIN LATERAL (SELECT * FROM ${checkerToSubmissionView} c where c.submission_id = s.submission_id and c.checker_role = 'qualityChecker' limit 1) quality_checker on quality_checker.submission_id = s.submission_id
        LEFT JOIN LATERAL (select * from ${manuscriptReviewsView} r where r.manuscript_custom_id = s.manuscript_custom_id and r.team_type = 'editor' order by submitted_date desc nulls last limit 1) last_editor_recommendation on last_editor_recommendation.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN (
          SELECT manuscript_custom_id, "version", count(*) as invited_reviewers_count,
            max(invited_date) as last_reviewer_invitation_date,
            min(invited_date) as first_reviewer_invitation_date
          from ${manuscriptReviewersView} group by manuscript_custom_id, "version"
        ) reviewers on reviewers.manuscript_custom_id = s.manuscript_custom_id and reviewers."version" = s."version"
        LEFT JOIN (
          SELECT manuscript_custom_id, count(distinct email) as reviewer_count
          from ${manuscriptReviewersView} where status = 'submitted' group by manuscript_custom_id
        ) submitting_reviewers on submitting_reviewers.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN (
          SELECT manuscript_custom_id, "version", count(*) as accepted_reviewers_count,
            min(accepted_date) as first_reviewer_accepted_date,
            max(accepted_date) as last_reviewer_accepted_date
          from ${manuscriptReviewersView} where status = 'accepted' group by manuscript_custom_id, version
        ) accepted_reviewers on accepted_reviewers.manuscript_custom_id = s.manuscript_custom_id and accepted_reviewers."version" = s."version"
        LEFT JOIN (SELECT manuscript_custom_id, "version", count(*) as pending_reviewers_count from ${manuscriptReviewersView} where responded_date is null group by manuscript_custom_id, version) pending_reviewers on pending_reviewers.manuscript_custom_id = s.manuscript_custom_id and pending_reviewers."version" = s."version"
        LEFT JOIN (
          SELECT manuscript_custom_id, "version", count(*) as review_reports_count,
            max(submitted_date) as last_review_report_submitted_date,
            min(submitted_date) as first_review_report_submitted_date
          from ${manuscriptReviewsView} where recommendation in ('publish', 'reject', 'minor', 'major') group by manuscript_custom_id, version) review_reports on review_reports.manuscript_custom_id = s.manuscript_custom_id and review_reports."version" = s."version"
        LEFT JOIN (
          SELECT manuscript_custom_id, count(*) as invited_handling_editors_count,
            min(invited_date) as first_handling_editor_invited_date,
            max(invited_date) as last_handling_editor_invited_date,
            min(accepted_date) first_handling_editor_accepted_date,
            max(accepted_date) current_handling_editor_accepted_date,
            max(declined_date) as last_handling_editor_declined_date
          from ${manuscriptEditorsView}
          where role_type = 'academicEditor' group by manuscript_custom_id
        ) handling_editors on handling_editors.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN ${acceptanceRatesView} individual_ar on individual_ar."month" = to_char(s.submission_date, 'YYYY-MM-01')::date and s.journal_id = individual_ar.journal_id
        LEFT JOIN (SELECT journal_id, avg(journal_rate) as journal_rate, avg(paid_regular_rate) as paid_regular_rate, avg(paid_special_issue_rate) as paid_special_issue_rate from ${acceptanceRatesView} group by "journal_id") avg_rate on avg_rate."journal_id" = s.journal_id
        LEFT JOIN LATERAL (select * from ${articleDataView} a WHERE
            a.manuscript_custom_id = s.manuscript_custom_id
          LIMIT 1) article_data on article_data.manuscript_custom_id = s.manuscript_custom_id
        LEFT JOIN LATERAL (select * from ${DELETED_MANUSCRIPTS_TABLE} d WHERE
          d.manuscript_custom_id = s.manuscript_custom_id
        LIMIT 1) deleted_manuscripts on deleted_manuscripts.manuscript_custom_id = s.manuscript_custom_id
    ) m
  WITH NO DATA;
`);

  const postCreateQueries = [
    `create index on manuscripts (submission_id)`,
    `create UNIQUE index on manuscripts (manuscript_custom_id)`,
    `create index on manuscripts (submission_date)`,
    `create index on manuscripts (resubmission_date)`,
    `create index on manuscripts (article_type)`,
    `create index on manuscripts (triage_editor_email)`,
    `create index on manuscripts (final_decision_date)`,
    `create index on manuscripts (final_decision_type)`,
    `create index on manuscripts (handling_editor_email)`,
    `create index on manuscripts (editorial_assistant_email)`,
    `create index on manuscripts (version)`,
    `create index on manuscripts (journal_id)`,
    `create index on manuscripts (journal_name)`,
    `create index on manuscripts (publisher_name)`,
    `create index on manuscripts (preprint_value)`,
    `create index on manuscripts (source_journal)`,
  ];

  for (const indexQuery of postCreateQueries) {
    const indexQueryStart = new Date();
    await knex.raw(indexQuery);
    logger.debug(
      `Creating indices ${indexQuery} took ${differenceInSeconds(
        indexQueryStart
      )} seconds`
    );
  }

  logger.info(
    `Creating materialized view and indices for "manuscripts" took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210324094400_create_manuscripts_mv.ts';
