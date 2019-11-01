export const up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.uuid('id').primary();
    table.string('articleId', 40);
    table.integer('status').defaultTo(0);
    table.integer('deleted').defaultTo(0);
    table.float('amount');
    table.datetime('dateCreated', {precision: 2, useTz: false});
    table.datetime('dateUpdated', {precision: 2, useTz: false});
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('transactions');
};
