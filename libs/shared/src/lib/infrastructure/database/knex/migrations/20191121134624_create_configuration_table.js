// TODO remove this table it's used only for demo
exports.up = function(knex) {
  return knex.schema.createTable('configurations', function(table) {
      table.integer('invoiceReferenceNumber')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('configurations')
};
