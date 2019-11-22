exports.up = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.integer('invoiceNumber').defaultsTo(null);
    table.unique('invoiceNumber')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('invoices', function(table) {
    table.dropUnique('invoiceNumber')
    table.dropColumn('invoiceNumber');
  });
};
