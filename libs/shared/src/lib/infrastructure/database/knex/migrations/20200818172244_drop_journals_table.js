/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.dropTable('journals');
};

module.exports.down = function (knex) {
  return knex.schema.createTable('journals', function (table) {
    table.string('id', 40).primary();
    table.string('name');
    table.integer('apc');
    table.string('code');
    table.string('email');
    table.string('issn');
    table.integer('isActive');
    table.dateTime('activationDate', { precision: 2, useTz: false });
  });
};
