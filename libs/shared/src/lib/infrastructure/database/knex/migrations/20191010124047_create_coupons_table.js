module.exports.up = function(knex) {
  return knex.schema.createTable('coupons', function(table) {
    table.string('id', 40).primary();
    table.string('name');
    table.boolean('valid');
    table.float('reduction');
    table.dateTime('created', {precision: 2, useTz: false});
  });
}

module.exports.down = function (knex) {
  return knex.schema.removeTable('coupons');
}
