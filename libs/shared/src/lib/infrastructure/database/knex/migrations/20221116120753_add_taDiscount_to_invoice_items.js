module.exports.up = function (knex) {
  return knex.schema.table('invoice_items', function (table) {
    table.float('taDiscount').defaultsTo(0);
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('invoice_items', function (table) {
    table.dropColumn('taDiscount');
  });
};
