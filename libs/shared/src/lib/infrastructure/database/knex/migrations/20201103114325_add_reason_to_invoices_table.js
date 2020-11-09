/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.string('creationReason', 40).nullable();
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.dropColumn('creationReason');
  });
};
