import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('coupons', function(table) {
    table.uuid('id').primary();
    table.string('name');
    table.boolean('valid');
    table.float('reduction');
    table.dateTime('created', {precision: 2, useTz: false});
  });
}

export async function down(knex: Knex): Promise<any> {}
