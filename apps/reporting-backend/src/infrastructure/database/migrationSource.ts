import Knex from 'knex';

// Migrations
import * as create_events_table from './migrations/20200128172115_create_events_tables';
import * as create_countries_table from './migrations/20200131121058_create_countries_table';
import * as create_submission_data_table from './migrations/20200224125858_create_submission_data_table';
import * as create_materialized_views from './migrations/20200224135858_create_materialized_views';

interface KnexMigration {
  up(Knex: Knex): Promise<any>;
  down(Knex: Knex): Promise<any>;
  name(): string;
}

function makeViewObject(viewFileExport: any): KnexMigration {
  return {
    up: viewFileExport.up,
    down: viewFileExport.down,
    name: viewFileExport.name
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
    create_materialized_views
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
