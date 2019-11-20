exports.up = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.integer('deleted').defaultsTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('articles', function(table) {
    table.dropColumn('deleted');
  });
};
