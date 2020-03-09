import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('article_events', table => {
    table.uuid('id').primary();
    table.timestamp('time');
    table.string('type');
    table.jsonb('payload');
    table.index('type');
    table.index('time');
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('article_events');
}

export const name = '20200304123458_create_article_events_table.ts';
