/* eslint-disable no-undef */
module.exports.up = function (knex) {
  return knex.schema.table('erp_references', (table) =>
    table
      .datetime('createdAt', { precision: 2, useTz: false })
      .notNullable()
      .defaultTo(knex.fn.now())
  );
};

module.exports.down = function (knex) {
  return knex.schema.table('erp_references', function (table) {
    table.dropColumn('createdAt');
  });
};
