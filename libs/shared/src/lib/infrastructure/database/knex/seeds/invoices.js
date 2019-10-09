exports.seed = async function(knex) {
  return knex('invoices').truncate()
    .then(function () {
      return knex('invoices').insert([
        {id: 'invoice-1', transactionId: 'transaction-1', status: 'DRAFT', totalAmount: 100, netAmount: 89, dateAdded: new Date()},
      ]);
    });
};
