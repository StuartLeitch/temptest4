/* eslint-disable no-undef */
module.exports.up = function (knex) {
  return knex.schema.table('payments', (table) =>
    table.enum('status', ['PENDING', 'FAILED', 'COMPLETED'])
  );
};

module.exports.down = function (knex) {
  return knex.schema.table('payments', function (table) {
    table.dropColumn('status');
  });
};
