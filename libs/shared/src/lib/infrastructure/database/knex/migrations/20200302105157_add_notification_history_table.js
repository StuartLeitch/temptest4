module.exports.up = function(knex) {
  return knex.schema.createTable('notifications_sent', function(table) {
    table.dateTime('dateSent', { precision: 2, useTz: false });
    table.string('id', 40).primary();
    table.string('invoiceId', 40);
    table.string('recipientEmail');
    table.enum('type', [
      'REMINDER_CONFIRMATION',
      'SANCTIONED_COUNTRY',
      'REMINDER_PAYMENT',
      'INVOICE_CREATED'
    ]);

    table.foreign('invoiceId').references('invoices.id');

    table.index('invoiceId');
    table.index(['invoiceId', 'type']);
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('notifications_sent');
};
