/* eslint-disable */
const uuid = require('uuid/v4');

const paymentMethods = [
  {
    id: uuid(),
    name: 'Credit Card',
    isActive: true,
  },
  {
    id: uuid(),
    name: 'Bank Transfer',
    isActive: true,
  },
  {
    id: uuid(),
    name: 'Paypal',
    isActive: true,
  },
];

const seed = async (knex) => {
  console.log('Seeding payment methods...');
  await knex('payment_methods').truncate();
  await Promise.all(
    paymentMethods.map((pm) => knex('payment_methods').insert(pm))
  );
};

exports.seed = seed;
