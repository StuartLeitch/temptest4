/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('catalog', function (table) {
    table.string('code', 200);
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('catalog', function (table) {
    table.dropColumn('code');
  });
};
