import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('peer_review_events', (table) => {
    table.uuid('id').primary();
    table.timestamp('time');
    table.string('type');
    table.jsonb('payload');
    table.index('type');
    table.index('time');
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('peer_review_events');
}

export const name = '20210111133315_create_peer_review_events_table';
