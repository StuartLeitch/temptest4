module.exports.up = function(knex) {
  return knex.schema.createTable('payers', function(table) {
    table.uuid('id').primary();
    table.string('title');
    table.string('surname');
    table.string('name');
    table.string('organization');
    table.string('uniqueIdentificationNumber');
    table.string('email');
    table.string('phone');
    table.string('type');
    table.string('shippingAddressId');
    table.string('billingAddressId');
    table.string('vatId');
    table.datetime('dateAdded', {precision: 2, useTz: false});
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('payers');
};
