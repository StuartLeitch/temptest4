import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('syndication_events', createEventTable);
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('syndication_events');
}

export const name = '20200629123541_add_syndication_events_table.ts';

function createEventTable(table) {
  table.uuid('id').primary();
  table.timestamp('time');
  table.string('type');
  table.jsonb('payload');
  table.index('type');
  table.index('time');
}
