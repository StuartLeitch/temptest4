module.exports.up = function (knex) {
  return knex.schema.table('payments', function (table) {
    table.string('authorizationCode');
    table.string('cardLastDigits');
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('payments', function (table) {
    table.dropColumn('authorizationCode');
    table.dropColumn('cardLastDigits');
  });
};
