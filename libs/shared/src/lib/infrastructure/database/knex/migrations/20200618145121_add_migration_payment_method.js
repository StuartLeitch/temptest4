/* eslint-disable */
const { v4 } = require('uuid');

module.exports.up = async function (knex) {
  const alreadyExists = await knex('payment_methods')
    .select('count(id)')
    .where({ name: 'Migration' })
    .first();

  if (alreadyExists.count == 0) {
    return knex('payment_methods').insert({
      id: v4(),
      name: 'Migration',
      isActive: false,
    });
  }

  return null;
};

module.exports.down = function (knex) {
  return null;
};
