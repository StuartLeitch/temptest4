/* eslint-disable */
const { v4 } = require('uuid');

const seed = async knex => {
  // console.log('seeding articles...');
  // await knex('articles').truncate();
  // const article = {
  //   id: '07e030f2-08d4-45c2-be22-3c2ac7a32057',
  //   journalId: '0dc559c7-ed6d-48f0-a7c9-3dad40f3144e',
  //   title: 'Mos Craciun si prietenii sai',
  //   articleType: 'Research Article',
  //   authorEmail: 'santa.claus@megamail.xyz',
  //   authorCountry: 'FI',
  //   authorFirstName: 'Klaus Werner',
  //   authorSurname: 'Iohannis',
  //   customId: '1234567'
  // };
  // await knex('articles').insert(article);
};

exports.seed = seed;
