exports.up = function(knex) {
  return knex.schema
    .table('transactions', function(table) {
      table.dropColumn('status');
    })
    .then(() => {
      knex.schema.table('transactions', function(table) {
        table.enum('status', ['DRAFT', 'ACTIVE', 'FINAL']).defaultTo('DRAFT');
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('invoice_items', function(table) {
    table.integer('status').defaultTo(0);
  });
};
