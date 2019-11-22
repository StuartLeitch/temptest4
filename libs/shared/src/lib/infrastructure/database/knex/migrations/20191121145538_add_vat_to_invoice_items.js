exports.up = function(knex, Promise) {
  return knex.schema.table('invoice_items', function(table) {
    table.integer('vat').defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('invoice_items', function(table) {
    table.dropColumn('vat');
  });
};
