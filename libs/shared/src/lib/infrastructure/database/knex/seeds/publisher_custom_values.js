/* eslint-disable */
const uuid = require('uuid/v4');

const paymentMethods = [
  {
    id: v4(),
    name: 'Credit Card',
    isActive: true,
  },
  {
    id: v4(),
    name: 'Bank Transfer',
    isActive: true,
  },
  {
    id: v4(),
    name: 'Paypal',
    isActive: true,
  },
];

const seed = async (knex) => {
  console.log('Seeding publisher custom values...');
  await knex('publisher_custom_values').truncate();

  const now = new Date();
  const hindawiId = uuid();
  const sageUKId = uuid();
  const sageUSId = uuid();
  const wileyId = uuid();
  const cupId = uuid();

  const publishers = [
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'Hindawi',
      id: hindawiId,
    },
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'Wiley',
      id: wileyId,
    },
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'Sage UK',
      id: sageUKId,
    },
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'Sage US',
      id: sageUSId,
    },
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'CUP',
      id: cupId,
    },
  ];

  await Promise.all(publishers.map((p) => knex('publishers').insert(p)));
  await knex.schema.table('catalog', (table) => {
    table.string('publisherId', 40).defaultTo(hindawiId).notNullable();
    table.foreign('publisherId').references('publishers.id');
  });

  const publisherCustomValues = [
    {
      name: 'tradeDocumentItem',
      publisherId: hindawiId,
      value: '01t0Y000002BuB9QAK',
    },
    {
      name: 'tradeDocumentItem',
      publisherId: sageUKId,
      value: '01t0Y000002BuB9QAK',
    },
    {
      name: 'tradeDocumentItem',
      publisherId: sageUSId,
      value: '01t0Y000002BuB9QAK',
    },
    {
      name: 'tradeDocumentItem',
      publisherId: cupId,
      value: '01t0Y000002BuB9QAK',
    },
    {
      name: 'tradeDocumentItem',
      publisherId: wileyId,
      value: '01t0Y000002BkzAQAS',
    },
    {
      name: 'journalReference',
      publisherId: hindawiId,
      value: 'Hindawi APC Recognition for article',
    },
    {
      name: 'journalReference',
      publisherId: wileyId,
      value: 'Wiley-Hindawi APC Recognition for article',
    },
    {
      name: 'journalReference',
      publisherId: sageUKId,
      value: 'Sage UK-Hindawi APC Recognition for article',
    },
    {
      name: 'journalReference',
      publisherId: sageUSId,
      value: 'Sage US-Hindawi APC Recognition for article',
    },
    {
      name: 'journalReference',
      publisherId: cupId,
      value: 'CUP-Hindawi APC Recognition for article',
    },
    {
      name: 'journalItemReference',
      publisherId: hindawiId,
      value: 'Hindawi APC Recognition for article',
    },
    {
      name: 'journalItemReference',
      publisherId: wileyId,
      value: 'Wiley-Hindawi APC Recognition for article',
    },
    {
      name: 'journalItemReference',
      publisherId: sageUKId,
      value: 'Sage UK-Hindawi APC Recognition for article',
    },
    {
      name: 'journalItemReference',
      publisherId: sageUSId,
      value: 'Sage US-Hindawi APC Recognition for article',
    },
    {
      name: 'journalItemReference',
      publisherId: cupId,
      value: 'CUP-Hindawi APC Recognition for article',
    },
    {
      name: 'journalTag',
      publisherId: hindawiId,
      value: 'a5L0Y000000g0EeUAI',
    },
    {
      name: 'journalTag',
      publisherId: sageUKId,
      value: 'a5L0Y000000g0EeUAI',
    },
    {
      name: 'journalTag',
      publisherId: sageUSId,
      value: 'a5L0Y000000g0EeUAI',
    },
    {
      name: 'journalTag',
      publisherId: cupId,
      value: 'a5L0Y000000g0EeUAI',
    },
    {
      name: 'journalTag',
      publisherId: wileyId,
      value: 'a5L0Y000000g0TMUAY',
    },
    {
      name: 'journalItemTag',
      publisherId: hindawiId,
      value: 'a5L0Y000000g0BmUAI',
    },
    {
      name: 'journalItemTag',
      publisherId: sageUKId,
      value: 'a5L0Y000000g0BmUAI',
    },
    {
      name: 'journalItemTag',
      publisherId: sageUSId,
      value: 'a5L0Y000000g0BmUAI',
    },
    {
      name: 'journalItemTag',
      publisherId: cupId,
      value: 'a5L0Y000000g0BmUAI',
    },
    {
      name: 'journalItemTag',
      publisherId: wileyId,
      value: 'a5L0Y000000fzUOUAY',
    },
    {
      name: 'customSegmentId',
      publisherId: hindawiId,
      value: '4',
    },
    {
      name: 'customSegmentId',
      publisherId: wileyId,
      value: '1',
    },
    {
      name: 'customSegmentId',
      publisherId: sageUKId,
      value: '1',
    },
    {
      name: 'customSegmentId',
      publisherId: sageUSId,
      value: '1',
    },
    {
      name: 'customSegmentId',
      publisherId: cupId,
      value: '1',
    },
    {
      name: 'itemId',
      publisherId: hindawiId,
      value: '22',
    },
    {
      name: 'itemId',
      publisherId: wileyId,
      value: '23',
    },
    {
      name: 'itemId',
      publisherId: sageUKId,
      value: '23',
    },
    {
      name: 'itemId',
      publisherId: sageUSId,
      value: '23',
    },
    {
      name: 'itemId',
      publisherId: cupId,
      value: '23',
    },
  ];

  await Promise.all(
    publisherCustomValues.map((pcv) =>
      knex('publisher_custom_values').insert(pcv)
    )
  );
};

exports.seed = seed;
