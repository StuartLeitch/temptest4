module.exports.up = function (knex) {
  return knex.schema.table('invoice_items', function (table) {
    table.string('taCode');
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('invoice_items', function (table) {
    table.dropColumn('taCode');
  });
};
