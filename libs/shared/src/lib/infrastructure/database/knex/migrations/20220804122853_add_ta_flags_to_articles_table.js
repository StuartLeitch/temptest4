/* eslint-disable no-undef */

module.exports.up = function (knex) {
  return knex.schema.table('articles', function (table) {
    table.boolean('taEligible').notNullable().default(false);
    table.boolean('taFundingApproved');
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('articles', function (table) {
    table.dropColumn('taEligible');
    table.dropColumn('taFundingApproved');
  });
};
