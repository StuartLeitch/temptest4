module.exports.up = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.string('authorFirstName', 40);
  });
};

module.exports.down = function(knex) {
  return knex.schema.table('authorFirstName', function(table) {
    table.dropColumn('authorFirstName');
  });
};
