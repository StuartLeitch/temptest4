module.exports.up = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.integer('is_cascaded').defaultsTo(0);
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.dropColumn('is_cascaded');
  });
};
