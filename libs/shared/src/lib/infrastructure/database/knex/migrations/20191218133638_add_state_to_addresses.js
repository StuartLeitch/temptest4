exports.up = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.string('state');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('addresses', function(table) {
    table.dropColumn('state');
  });
};
