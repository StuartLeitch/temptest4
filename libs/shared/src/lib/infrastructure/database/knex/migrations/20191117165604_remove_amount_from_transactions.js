exports.up = function(knex, Promise) {
  return knex.schema.table('transactions', function(table) {
    table.dropColumn('amount');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('transactions', function(table) {
    table.float('amount');
  });
};
