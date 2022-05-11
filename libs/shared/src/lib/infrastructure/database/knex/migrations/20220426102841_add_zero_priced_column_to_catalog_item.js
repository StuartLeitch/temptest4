/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('catalog', function (table) {
    table.boolean('zeroPriced').notNullable().defaultTo(false);
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('catalog', function (table) {
    table.dropColumn('zeroPriced');
  });
};
