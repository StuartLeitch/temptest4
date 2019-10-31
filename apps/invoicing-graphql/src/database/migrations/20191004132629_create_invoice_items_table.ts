module.exports.up = function(knex) {
  return knex.schema.createTable('invoice_items', function(table) {
    table.uuid('id', 36).primary();
    table.string('invoiceId', 40);
    table.string('manuscriptId', 40);
    table.string('name', 40);
    table.string('type').defaultTo('APC');
    table.float('price');
    table.integer('deleted').defaultTo(1);
    table.datetime('dateCreated', {precision: 2, useTz: false});
  });
};

module.exports.down = (knex) => ({});
