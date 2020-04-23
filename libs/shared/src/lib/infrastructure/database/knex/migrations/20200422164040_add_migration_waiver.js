/* eslint-disable no-undef */
module.exports.up = function (knex) {
  return knex.table('waivers').insert({
    type_id: 'WAIVED_MIGRATION',
    reduction: 100,
    isActive: false,
    metadata: {},
  });
};

module.exports.down = function (knex) {
  return knex.table('waivers').where({ type_id: 'WAIVED_MIGRATION' }).del();
};
