const seed_invoices_uuid = require('uuid/v4');

const seed = async knex => {
  await knex('invoices').truncate();

  return knex('invoices').insert([
    {
      id: seed_invoices_uuid(),
      transactionId: 'transaction-1',
      status: 0,
      dateCreated: new Date()
    }
  ]);
};

module.exports.seed = (knex) => seed(knex);
