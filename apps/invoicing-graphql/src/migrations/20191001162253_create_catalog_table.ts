export const up = function(knex) {
  return knex.schema.createTable('catalog', function(table) {
    table
      .uuid('id', 36)
      .unique()
      .notNullable()
      .primary();
    table.string('journalId');
    table.string('journalTitle');
    table.string('issn');
    table.string('type');
    table.float('amount').defaultTo(0);
    table.string('currency').defaultTo('USD');
    table.datetime('created', {precision: 2, useTz: false});
    table.datetime('updated', {precision: 2, useTz: false});
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('catalog');
};
