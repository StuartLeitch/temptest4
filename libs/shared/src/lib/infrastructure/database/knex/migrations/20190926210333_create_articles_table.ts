export const up = function(knex) {
  return knex.schema.createTable('articles', function(table) {
    table.uuid('id').primary();
    table.string('journalId');
    table.string('title');
    table.string('articleTypeId');
    table.string('authorEmail');
    table.string('authorCountry');
    table.string('authorSurname');
    table.datetime('created', {precision: 2, useTz: false});
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('articles');
};
