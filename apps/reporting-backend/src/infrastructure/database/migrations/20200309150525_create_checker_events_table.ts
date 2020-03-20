import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return Promise.all([
    knex.schema.createTable('checker_events', createTable),
    knex.raw(
      `insert into checker_events select * from dump_events de where de.type in ('CheckerTeamCreated', 'CheckerTeamUpdated', 'ScreenerAssigned', 'ScreenerReassigned', 'QualityCheckerAssigned', 'QualityCheckerReassigned')`
    )
  ]);
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('checker_events');
}

export const name = '20200309150525_create_checker_events_table.ts';

const createTable = table => {
  table.uuid('id').primary();
  table.timestamp('time');
  table.string('type');
  table.jsonb('payload');
  table.index('type');
  table.index('time');
};
