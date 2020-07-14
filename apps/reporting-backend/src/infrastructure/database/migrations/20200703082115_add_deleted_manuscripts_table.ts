import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('deleted_manuscripts', function (table) {
    table.string('manuscript_custom_id').primary();
    table.string('reason').nullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('deleted_manuscripts');
}

export const name = '20200703082115_add_deleted_manuscripts_table.ts';
