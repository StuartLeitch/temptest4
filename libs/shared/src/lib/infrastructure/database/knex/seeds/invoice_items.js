/* eslint-disable */
const uuid = require('uuid/v4');

const seed = async (knex) => {
  // console.log('seeding invoice items...');
  // await knex('invoice_items').truncate();
  // const journal = {
  //   id: '20aedf94-f74f-47a2-bf33-94c5a4700c16',
  //   invoiceId: 'e23b6c52-eee8-4ca9-bfec-5c9a9d8b00c9',
  //   manuscriptId: '07e030f2-08d4-45c2-be22-3c2ac7a32057',
  //   type: 'APC',
  //   price: 1000
  // };
  // await knex('invoice_items').insert(journal);
};

exports.seed = seed;
