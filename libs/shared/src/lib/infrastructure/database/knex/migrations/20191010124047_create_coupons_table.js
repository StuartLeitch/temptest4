module.exports.up = function(knex) {
  return knex.schema.createTable('coupons', function(table) {
    table.uuid('id').primary();
    table.string('name');
    table.boolean('valid');
    table.float('reduction');
    table.dateTime('created', {precision: 2, useTz: false});
  });
}

module.exports.down = function (knex) {
  return knex.schema.removeTable('coupons');
}
