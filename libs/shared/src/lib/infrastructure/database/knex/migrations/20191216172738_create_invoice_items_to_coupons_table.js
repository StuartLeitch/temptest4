exports.up = function(knex) {
  return knex.schema.createTable('invoice_items_to_coupons', function(table) {
    table.string('invoiceItemId');
    table.foreign('invoiceItemId').references('invoice_items.id');
    table.string('couponId');
    table.foreign('couponId').references('coupons.id');
    table.datetime('dateCreated', { precision: 2, useTz: false });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('invoice_items_to_coupons');
};
