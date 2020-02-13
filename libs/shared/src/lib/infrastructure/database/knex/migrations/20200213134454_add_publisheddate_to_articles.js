module.exports.up = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.datetime('datePublished', { precision: 2, useTz: false });
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.dropColumn('datePublished');
  });
};
