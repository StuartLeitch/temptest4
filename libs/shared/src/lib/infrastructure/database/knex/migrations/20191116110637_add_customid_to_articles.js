module.exports.up = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.string('customId', 40);
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.dropColumn('customId');
  });
};
