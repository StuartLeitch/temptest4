exports.up = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.integer('invoiceNumber').defaultsTo(null);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('invoices', function(table) {
    table.dropColumn('invoiceNumber');
  });
};
