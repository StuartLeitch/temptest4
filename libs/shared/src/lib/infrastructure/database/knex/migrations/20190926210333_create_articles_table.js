module.exports.up = function(knex) {
  return knex.schema.createTable('articles', function(table) {
    table.string('id', 40).primary();
    table.string('journalId', 40);
    table.string('title');
    table.string('articleTypeId');
    table.string('authorEmail');
    table.string('authorCountry');
    table.string('authorSurname');
    table.datetime('created', { precision: 2, useTz: false });
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('articles');
};
