exports.up = function(knex) {
  return knex.schema.table('coupons', function(table) {
    table.dropColumn('valid');
    table.dropColumn('created');
    table.enum('type', ['SINGLE_USE', 'MULTIPLE_USE']);
    table.string('code', 10).unique();
    table.enum('status', ['ACTIVE', 'INACTIVE']);
    table.enum('invoiceItemType', ['APC', 'PRINT ORDER']);
    table.integer('redeemCount').defaultsTo(0);
    table.datetime('dateCreated', { precision: 2, useTz: false });
    table.datetime('dateUpdated', { precision: 2, useTz: false });
    table.datetime('expirationDate', { precision: 2, useTz: false });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('coupons');
};
