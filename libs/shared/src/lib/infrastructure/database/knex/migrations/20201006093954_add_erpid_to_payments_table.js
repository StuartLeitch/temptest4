/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('payments', function (table) {
    table.string('erpid', 40);
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('payments', function (table) {
    table.dropColumn('erpid');
  });
};
