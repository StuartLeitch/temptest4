module.exports.up = function(knex) {
  return knex.schema.createTable('payers', function(table) {
    table.string('id', 40).primary();
    table.string('title');
    table.string('name');
    table.string('organization');
    table.string('uniqueIdentificationNumber');
    table.string('email');
    table.string('phone');
    table.enum('type', ['INSTITUTION', 'INDIVIDUAL']);
    table.string('shippingAddressId');
    table.string('billingAddressId');
    table.string('vatId');
    table.datetime('dateAdded', {precision: 2, useTz: false});
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('payers');
};
