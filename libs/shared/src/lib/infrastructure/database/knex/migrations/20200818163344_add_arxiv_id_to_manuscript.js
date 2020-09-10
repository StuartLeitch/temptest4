/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('articles', function (table) {
    table.string('arxivId').nullable();
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('articles', function (table) {
    table.dropColumn('arxivId');
  });
};
