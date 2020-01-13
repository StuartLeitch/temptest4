exports.up = function(knex) {
  return knex.schema.createTable('invoice_items_to_waivers', function(table) {
    table.string('invoiceItemId');
    table.foreign('invoiceItemId').references('invoice_items.id');
    table.string('waiverId');
    table.foreign('waiverId').references('waivers.type_id');
    table.unique(['invoiceItemId', 'waiverId']);
    table
      .datetime('dateCreated', { precision: 2, useTz: false })
      .defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('invoices_to_waivers');
};
