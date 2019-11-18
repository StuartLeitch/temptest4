exports.up = function(knex, Promise) {
  return knex.schema.table('transactions', function(table) {
    table.dropColumn('articleId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('transactions', function(table) {
    table.string('articleId', 40);
  });
};
