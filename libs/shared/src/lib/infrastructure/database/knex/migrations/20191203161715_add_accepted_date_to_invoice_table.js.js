module.exports.up = function(knex) {
  return knex
    .select()
    .from('invoices')
    .then(invoices => {
      const inovoicesCreationDates = invoices.map(row => {
        return { invoiceId: row.id, dateCreated: row.dateCreated };
      });
      return knex.transaction(trx => {
        return knex.schema
          .table('invoices', table =>
            table.datetime('dateAccepted', { precision: 2, useTz: false })
          )
          .then(() =>
            Promise.all(
              inovoicesCreationDates.map(row => {
                return knex('invoices')
                  .update({ dateAccepted: row.dateCreated })
                  .where({ id: row.invoiceId })
                  .transacting(trx);
              })
            )
          )
          .then(trx.commit)
          .catch(trx.rollback);
      });
    });
};

module.exports.down = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.dropColumn('dateAccepted');
  });
};
