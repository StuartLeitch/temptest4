/* eslint-disable */
const { v4 } = require('uuid');

const paymentMethods = [
  {
    id: v4(),
    name: 'Credit Card',
    isActive: true
  },
  {
    id: v4(),
    name: 'Bank Transfer',
    isActive: true
  },
  {
    id: v4(),
    name: 'Paypal',
    isActive: true
  }
];

const seed = async knex => {
  await knex('payment_methods').truncate();

  await Promise.all(
    paymentMethods.map(pm => knex('payment_methods').insert(pm))
  );
};

exports.seed = async knex => seed(knex);
