/* eslint-disable no-undef */

module.exports.up = function(knex) {
  return knex.schema.table('audit_logs', function(table) {
    table.string('item_reference', 200);
    table.string('target', 200);
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('audit_logs', function(table) {
    table.dropColumn('item_reference');
    table.dropColumn('target');
  });
};
