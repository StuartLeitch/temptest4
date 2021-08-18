module.exports.up = async function (knex) {
    await knex.schema.createTable('credit_notes', (table) => {
        table.string('id', 40).primary();
        table.string('invoiceId', 40);
        table.enum('creationReason', ['withdrawn-manuscript', 'reduction-applied', 'waived-manuscript', 'change-payer-details', 'bad-debt', 'other']);
        table.integer('vat').defaultTo(0);
        table.integer('price').defaultTo(0);
        table.string('persistentReferenceNumber', 40);
        table.dateTime('dateCreated', { precision: 2, useTz: false });
        table.dateTime('dateIssued', { precision: 2, useTz: false });
        table.dateTime('dateUpdated', { precision: 2, useTz: false });
    });
};

module.exports.down = async function (knex) {
    await knex.schema.dropTable('credit_notes');
}