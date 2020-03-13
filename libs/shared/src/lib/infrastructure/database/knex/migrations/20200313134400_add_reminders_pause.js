module.exports.up = function(knex) {
  return knex.schema.createTable('paused_reminders', function(table) {
    table.string('invoiceId', 40).primary();
    table.boolean('pauseConfirmation');
    table.boolean('pausePayment');

    table.foreign('invoiceId').references('invoices.id');

    table.index('invoiceId');
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('paused_reminders');
};
