import Knex from 'knex';

// Migrations
import * as create_events_table from './migrations/20200128172115_create_events_tables';
import * as create_countries_table from './migrations/20200131121058_create_countries_table';
import * as create_submission_data_table from './migrations/20200224125858_create_submission_data_table';
import * as remove_submission_data_dates from './migrations/20200304113458_remove_wrong_dates_from_submission_data';
import * as create_article_events_table from './migrations/20200304123458_create_article_events_table';
import * as create_checker_events_table from './migrations/20200309150525_create_checker_events_table';
import * as create_materialized_views from './migrations/create_materialized_views';
import * as create_journal_to_publisher_table from './migrations/20200311104931_create_journal_to_publisher_table';
import * as create_superset_helper_functions from './migrations/20200325162543_create_superset_helper_functions';
import * as add_sub_data_update_trigger from './migrations/20200406150014_add_sub_data_update_trigger';
import * as add_sub_data_index from './migrations/20200416123141_add_sub_data_index';
import * as add_acceptance_rates_table from './migrations/20200610141941_add_acceptance_rates_table';
import * as create_syndication_events_table from './migrations/20200629123541_add_syndication_events_table';
import * as add_deleted_manuscripts_table from './migrations/20200703082115_add_deleted_manuscripts_table';
import * as add_preprint_value_to_submission_data from './migrations/20200831162115_add_preprint_value_to_submission_data';
import * as move_article_events from './migrations/20201012162115_move_article_events';
import * as create_peer_review_events_table from './migrations/20210111133315_create_peer_review_events_table';
import * as move_peer_review_events from './migrations/20210112142215_move_peer_review_events';
import * as fix_submission_data_version from './migrations/20210204150015_fix_submission_data_version';
import * as add_source_journal_to_submission_data from './migrations/20210301162115_add_source_journal_to_submission_data';
import * as create_article_data_mv from './migrations/20210322122200_create_article_data_mv';
import * as create_users_data_mv from './migrations/20210322143000_create_users_data_mv';
import * as create_invoices_data_mv from './migrations/20210322145600_create_invoices_data_mv';
import * as create_checker_submission_data_mv from './migrations/20210322152400_create_checker_submission_data_mv';
import * as create_checker_team_data_mv from './migrations/20210322153600_create_checker_team_data_mv';
import * as create_journals_data_mv from './migrations/20210322155500_create_journals_data_mv';
import * as create_peer_review_data_mv from './migrations/20210322160500_create_peer_review_data_mv';
import * as create_checker_to_submission_mv from './migrations/20210322162600_create_checker_to_submission_mv';
import * as create_checker_to_team_mv from './migrations/20210323123600_create_checker_to_team_mv';
import * as create_journals_mv from './migrations/20210323132000_create_journals_mv';
import * as create_journal_sections_mv from './migrations/20210323150600_create_journal_sections_mv';

interface KnexMigration {
  up(Knex: Knex): Promise<any>;
  down(Knex: Knex): Promise<any>;
  name(): string;
}

function makeViewObject(viewFileExport: any): KnexMigration {
  if (!viewFileExport.up || !viewFileExport.down || !viewFileExport.name) {
    throw new Error(
      `View object with name:${viewFileExport.name} doesn't implement KnexMigration interface.`
    );
  }
  return {
    up: viewFileExport.up,
    down: viewFileExport.down,
    name: viewFileExport.name,
  };
}

/**
 * Rebuilds views as a migration. Add skip = true after adding a new rebuild materialized view migration.
 * @param name
 * @param skip
 */
export function rebuild_materialized_views(name: string, skip = false): any {
  return {
    up: async (knex: any) => {
      if (!skip) {
        await create_materialized_views.down(knex);
        return create_materialized_views.up(knex);
      }
    },
    // up: create_materialized_views.up,
    down: create_materialized_views.down,
    name,
  };
}

// View migration should be done following the steps:
// 1. Delete de view
// 2. Create the view
// 3. Run post create queries
class KnexMigrationSource {
  private migrations: KnexMigration[] = [
    create_events_table,
    create_countries_table,
    create_submission_data_table,
    remove_submission_data_dates,
    create_article_events_table,
    create_checker_events_table,

    // rebuild_materialized_views(
    //   // rmv stands for "rebuild_materialized_views"
    //   '20200310150525_rebuild_materialized_views',
    //   true
    // ), // todo delete this

    create_journal_to_publisher_table,
    // rebuild_materialized_views(
    //   '20200316122800_add_waivers_to_invoices_view',
    //   true
    // ),
    // rebuild_materialized_views('20200323252800_fix_manuscript_view', true),
    create_superset_helper_functions,
    // rebuild_materialized_views(
    //   '20200323252800_add_ea_dates_manuscript_view',
    //   true
    // ),
    // rebuild_materialized_views('20200325122800_add_id_to_reviewers', true),
    add_sub_data_update_trigger,
    // rebuild_materialized_views('20200408122800_fix_inv_m_accept_date', true),
    // rebuild_materialized_views(
    //   '20200409122800_fix_removed_academic_editor',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200409122800_add_default_date_to_views',
    //   true
    // ),
    // rebuild_materialized_views('20200409122800_fix_invoice_net_amount', true),
    // rebuild_materialized_views(
    //   '20200413093900_fix_academic_editor_dates',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200415131000_add_invoice_amount_to_manuscripts',
    //   true
    // ),
    add_sub_data_index,
    // rebuild_materialized_views('20200421151200_fix_manuscript_authors', true),
    // rebuild_materialized_views('20200427133000_add_manuscript_apc', true),
    // rebuild_materialized_views('20200427141500_add_credit_note_support', true),
    // rebuild_materialized_views(
    //   '20200430172400_add_editor_reviewers_to_manuscripts',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200430172400_add_screening_dates_to_manuscripts',
    //   true
    // ),
    // rebuild_materialized_views('20200507121500_add_inv_payer_address', true),
    // rebuild_materialized_views('20200511082600_fix_submission_dates', true),
    // rebuild_materialized_views(
    //   '20200513191500_reviews_type_submission_dates',
    //   true
    // ),
    // rebuild_materialized_views('20200525131500_invoices_costs_changes', true),
    // rebuild_materialized_views('20200525181500_add_payments_view', true),
    // rebuild_materialized_views(
    //   '20200605121500_add_material_checks_dates',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200609151800_fix_invoices_ref_number_n_apc',
    //   true
    // ),
    // rebuild_materialized_views('20200609153500_add_void_manuscripts', true),
    // rebuild_materialized_views('20200610131500_add_vendor_full_access', true),
    add_acceptance_rates_table,
    // rebuild_materialized_views('20200611121000_fix_manuscripts_apc', true),
    // rebuild_materialized_views(
    //   '20200611121000_add_manuscripts_refresh_concurrency',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200611131000_add_acceptance_rates_fields_to_views',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200616152900_fix_inv_man_accepted_date',
    //   true
    // ),
    // rebuild_materialized_views('20200617123100_add_inv_payment_ref', true),
    // rebuild_materialized_views('20200618150700_add_special_issue_view', true),
    create_syndication_events_table,
    // rebuild_materialized_views(
    //   '20200629131100_m_published_date_from_article_data',
    //   true
    // ),
    add_deleted_manuscripts_table,
    // rebuild_materialized_views(
    //   '20200703082515_add_deleted_to_manuscripts_view',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200703084515_add_manuscript_users_view',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200703091515_add_last_editor_declined_date',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200729121500_add_screening_paused_dates',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200729131500_change_accepted_peer_review_cycle',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20200729141500_manuscripts_si_editor_fields',
    //   true
    // ),
    add_preprint_value_to_submission_data,
    // rebuild_materialized_views(
    //   '20200831162115_add_preprint_value_to_submissions',
    //   true
    // ),
    // rebuild_materialized_views('20200901362115_add_more_paused_dates', true),
    // rebuild_materialized_views('20200901362115_file_requested_counts', true),
    // rebuild_materialized_views('20200901662115_manuscript_users_orcid', true),
    // rebuild_materialized_views(
    //   '20200902662115_invoices_manuscript_accepted_date_fix',
    //   true
    // ),
    // rebuild_materialized_views('20200914662115_qc_events_rename', true),
    // rebuild_materialized_views('20200915122115_add_deleted_invoices', true),
    // rebuild_materialized_views('20200916122115_fix_invoices_issue_type', true),
    move_article_events,
    // rebuild_materialized_views('20201023122115_prrccp_fix', true),
    // rebuild_materialized_views(
    //   '20201026122115_add_more_first_dates_manuscripts',
    //   true
    // ),
    // rebuild_materialized_views('20201026132115_add_submission_apc', true),
    // rebuild_materialized_views(
    //   '20201026142115_add_journal_info_editors_view',
    //   true
    // ),
    // rebuild_materialized_views('20201027142115_rework_submissions_view', true),
    // rebuild_materialized_views('20201027152115_acceptance_rates_fix', true),
    // rebuild_materialized_views(
    //   '20201028152115_acceptance_rates_fix_historical',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20201118152115_journal_peer_review_model',
    //   true
    // ),
    // rebuild_materialized_views('20201119152115_invoices_numbers_fix', true),
    create_peer_review_events_table,
    move_peer_review_events,
    // rebuild_materialized_views(
    //   '20210106114615_add_peer_review_cycle_check_date',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20210118140815_add_last_requested_revision_date',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20210118150015_report_reviewer_update_on_manuscript_view',
    //   true
    // ),
    // rebuild_materialized_views(
    //   '20210202150015_restore_review_report_count',
    //   true
    // ),
    fix_submission_data_version,
    add_source_journal_to_submission_data,
    // rebuild_materialized_views(
    //   '20210301162115_add_source_journal_to_submission_data',
    //   true
    // ),
    create_article_data_mv,
    create_users_data_mv,
    create_invoices_data_mv,
    create_checker_submission_data_mv,
    create_checker_team_data_mv,
    create_journals_data_mv,
    create_peer_review_data_mv,
    create_checker_to_submission_mv,
    create_checker_to_team_mv,
    create_journals_mv,
    create_journal_sections_mv
  ].map(makeViewObject);

  getMigrations(): Promise<KnexMigration[]> {
    return Promise.resolve(this.migrations);
  }

  getMigrationName(migration): string {
    return migration.name;
  }

  getMigration(migration): KnexMigration {
    return migration;
  }
}

const knexMigrationSource = new KnexMigrationSource();

export { knexMigrationSource };
