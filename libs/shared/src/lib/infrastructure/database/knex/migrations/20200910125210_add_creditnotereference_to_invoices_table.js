/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.string('creditNoteReference', 40);
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.dropColumn('creditNoteReference');
  });
};
