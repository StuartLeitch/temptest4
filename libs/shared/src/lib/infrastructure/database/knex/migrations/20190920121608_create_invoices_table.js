module.exports.up = async function(knex) {
  return knex.schema
    .createTable('invoices', function(table) {
      table.uuid('id').primary();
      table.string('transactionId', 40);
      table.integer('status').defaultTo(0);
      table.integer('deleted').defaultsTo(0);
      table.datetime('dateCreated', {precision: 2, useTz: false}); //.defaultTo(knex.fn.now(2));
    })
    .then(function() {
      return knex.schema.createTable('waivers', function(table) {
        table.uuid('id').primary();
        table.string('type');
        table.float('percentage');
      });
    })
    .then(function() {
      return knex.schema.createTable('invoices_waivers', function(table) {
        // table.increments().primary();
        table
          .uuid('invoiceId')
          .unsigned()
          .references('id')
          .inTable('invoices');
        table
          .uuid('waiverId')
          .unsigned()
          .references('id')
          .inTable('waivers');
      });
    });
};

module.exports.down = async function(knex) {
  //await knex.raw('DROP EXTENSION IF EXISTS "uuid"');
  knex.schema.dropTable('invoices');
  knex.schema.dropTable('waivers');
  knex.schema.dropTable('invoices_waivers');
};
