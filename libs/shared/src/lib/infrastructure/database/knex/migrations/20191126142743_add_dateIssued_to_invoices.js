module.exports.up = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.datetime('dateIssued', { precision: 2, useTz: false });
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.dropColumn('dateIssued');
  });
};
