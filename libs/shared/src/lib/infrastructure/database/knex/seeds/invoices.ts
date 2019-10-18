import uuid from 'uuid/v4';
import * as Knex from 'knex';

exports.seed = (knex: Knex) => seed(knex);

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
