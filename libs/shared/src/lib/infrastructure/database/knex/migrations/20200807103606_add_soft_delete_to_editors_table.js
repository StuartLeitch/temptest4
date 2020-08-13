/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('editors', function (table) {
    table.integer('deleted').defaultsTo(0);
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('editors', function (table) {
    table.dropColumn('deleted');
  });
};
