const uuid = require('uuid/v4');

module.exports.seed = (knex) => seed(knex);

const seed = async knex => {
  await knex('invoices').truncate();

  return knex('invoices').insert([
    {
      id: uuid(),
      transactionId: 'transaction-1',
      status: 0,
      dateCreated: new Date()
    }
  ]);
};

export {};
