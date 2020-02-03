import Knex from 'knex';

// Migrations
import * as create_events_table from './migrations/20200128172115_create_events_tables';
import * as create_countries_table from './migrations/20200131121058_create_countries_table';
import * as create_materialized_views from './migrations/20200131135858_create_materialized_views';

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
    create_materialized_views
  ].map(makeViewObject);
  // Must return a Promise containing a list of migrations.
  // Migrations can be whatever you want, they will be passed as
  // arguments to getMigrationName and getMigration
  getMigrations(): Promise<KnexMigration[]> {
    // In this example we are just returning migration names
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
