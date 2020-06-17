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
    rebuild_materialized_views(
      '20200310150525_rebuild_materialized_views',
      true
    ), // todo delete this
    create_journal_to_publisher_table,
    rebuild_materialized_views(
      '20200316122800_add_waivers_to_invoices_view',
      true
    ),
    rebuild_materialized_views('20200323252800_fix_manuscript_view', true),
    create_superset_helper_functions,
    rebuild_materialized_views(
      '20200323252800_add_ea_dates_manuscript_view',
      true
    ),
    rebuild_materialized_views('20200325122800_add_id_to_reviewers', true),
    add_sub_data_update_trigger,
    rebuild_materialized_views('20200408122800_fix_inv_m_accept_date', true),
    rebuild_materialized_views(
      '20200409122800_fix_removed_academic_editor',
      true
    ),
    rebuild_materialized_views(
      '20200409122800_add_default_date_to_views',
      true
    ),
    rebuild_materialized_views('20200409122800_fix_invoice_net_amount', true),
    rebuild_materialized_views(
      '20200413093900_fix_academic_editor_dates',
      true
    ),
    rebuild_materialized_views(
      '20200415131000_add_invoice_amount_to_manuscripts',
      true
    ),
    add_sub_data_index,
    rebuild_materialized_views('20200421151200_fix_manuscript_authors', true),
    rebuild_materialized_views('20200427133000_add_manuscript_apc', true),
    rebuild_materialized_views('20200427141500_add_credit_note_support', true),
    rebuild_materialized_views(
      '20200430172400_add_editor_reviewers_to_manuscripts',
      true
    ),
    rebuild_materialized_views(
      '20200430172400_add_screening_dates_to_manuscripts',
      true
    ),
    rebuild_materialized_views('20200507121500_add_inv_payer_address', true),
    rebuild_materialized_views('20200511082600_fix_submission_dates', true),
    rebuild_materialized_views(
      '20200513191500_reviews_type_submission_dates',
      true
    ),
    rebuild_materialized_views('20200525131500_invoices_costs_changes', true),
    rebuild_materialized_views('20200525181500_add_payments_view', true),
    rebuild_materialized_views(
      '20200605121500_add_material_checks_dates',
      true
    ),
    rebuild_materialized_views(
      '20200609151800_fix_invoices_ref_number_n_apc',
      true
    ),
    rebuild_materialized_views('20200609153500_add_void_manuscripts', true),
    rebuild_materialized_views('20200610131500_add_vendor_full_access', true),
    add_acceptance_rates_table,
    rebuild_materialized_views('20200611121000_fix_manuscripts_apc', true),
    rebuild_materialized_views(
      '20200611121000_add_manuscripts_refresh_concurrency',
      true
    ),
    rebuild_materialized_views(
      '20200611131000_add_acceptance_rates_fields_to_views',
      true
    ),
    rebuild_materialized_views(
      '20200616152900_fix_inv_man_accepted_date',
      true
    ),
    rebuild_materialized_views('20200617123100_add_inv_payment_ref'),
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
