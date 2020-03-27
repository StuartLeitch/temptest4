/* eslint-disable no-undef */
module.exports.up = function (knex) {
  return knex
    .select([`invoices.*`, `payments.datePaid`])
    .from('invoices')
    .leftJoin('payments', 'invoices.id', 'payments.invoiceId')
    .then((invoices) => {
      const invoicesMovedToFinalDates = invoices.map((row) => ({
        invoiceId: row.id,
        dateIssued: row.dateIssued,
        datePaid: row.datePaid,
      }));
      return knex.transaction((trx) => {
        return knex.schema
          .table('invoices', (table) =>
            table.datetime('dateMovedToFinal', { precision: 2, useTz: false })
          )
          .then(() =>
            Promise.all(
              invoicesMovedToFinalDates.map((row) => {
                return knex('invoices')
                  .update({ dateMovedToFinal: row.datePaid || row.dateIssued })
                  .where({ id: row.invoiceId })
                  .whereNotNull('invoiceNumber')
                  .transacting(trx);
              })
            )
          )
          .then(trx.commit)
          .catch(trx.rollback);
      });
    });
};

module.exports.down = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.dropColumn('dateMovedToFinal');
  });
};
