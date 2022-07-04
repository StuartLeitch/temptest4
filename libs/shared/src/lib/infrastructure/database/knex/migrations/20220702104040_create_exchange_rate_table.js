/* eslint-disable no-undef */

module.exports.up = async function (knex) {
  await knex.schema.createTable('usd_gbp_exchange_rate', (table) => {
    table.date('exchangeDate').primary();
    table.float('exchangeRate', 8, 6).notNullable();
  });
};

module.exports.down = async function (knex) {
  await knex.schema.dropTable('usd_gbp_exchange_rate');
};
