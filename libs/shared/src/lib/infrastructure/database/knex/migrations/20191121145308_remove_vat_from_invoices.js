exports.up = function(knex, Promise) {
  return knex.schema.table('invoices', function(table) {
    table.dropColumn('vat');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('invoices', function(table) {
    table.integer('vat').defaultTo(0);
  });
};
