/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.raw(`
    update
      invoices
    set
      "persistentReferenceNumber"=substring("persistentReferenceNumber", 1, 7) || '2023'
    where
      "dateIssued" >= '2022-05-01' and
      "dateIssued" < '2023-05-01'
  `);
};

module.exports.down = function (knex) {};
