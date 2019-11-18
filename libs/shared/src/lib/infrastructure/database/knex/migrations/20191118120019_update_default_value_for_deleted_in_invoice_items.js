exports.up = function(knex) {
  return knex.schema
    .table('invoice_items', function(table) {
      table.dropColumn('deleted');
    })
    .then(() => {
      return knex.schema.table('invoice_items', function(table) {
        table.integer('deleted').defaultTo(0);
      });
    })
    .then(() => {
      return knex.schema.table('invoice_items', function(table) {
        table.dropColumn('name');
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('invoice_items', function(table) {
    table.integer('deleted').defaultTo(1);
    table.string('name', 40);
  });
};
