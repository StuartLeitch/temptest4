exports.up = function(knex) {
  return knex.schema
    .table('transactions', function(table) {
      table.dropColumn('status');
    })
    .then(() => {
      return knex.schema.table('transactions', function(table) {
        table.enum('status', ['DRAFT', 'ACTIVE', 'FINAL']);
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('transactions', function(table) {
    table.integer('status').defaultTo(0);
  });
};
