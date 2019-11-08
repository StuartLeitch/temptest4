module.exports.up = function(knex) {
  return knex.schema.createTable('payment_methods', function(table) {
    table.string('id', 40).primary();
    table.string('name');
    table.boolean('isActive');
    table.datetime('datePaid', {precision: 2, useTz: false});
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('payment_methods');
};
