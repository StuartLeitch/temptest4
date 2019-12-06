module.exports.up = function(knex) {
  return knex.schema.table('editors', function(table) {
    table.string('userId', 40);
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('editors', function(table) {
    table.dropColumn('userId');
  });
};
