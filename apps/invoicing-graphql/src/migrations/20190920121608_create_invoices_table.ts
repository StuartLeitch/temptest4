import {uuid} from 'uuid/v4';

export const up = async function(knex) {
  //await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid"');

  return knex.schema.createTable('invoices', function(table) {
    table
      .uuid('id', 36)
      .unique()
      .notNullable()
      .primary();
    table.string('transactionId', 40);
    table.integer('status').defaultTo(0);
    table.integer('deleted').defaultsTo(0);
    table.datetime('dateCreated', {precision: 2, useTz: false}); //.defaultTo(knex.fn.now(2));
  });
};

export const down = async function(knex) {
  //await knex.raw('DROP EXTENSION IF EXISTS "uuid"');
  return knex.schema.dropTable('invoices');
};
