/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const uuid = require('uuid/v4');

module.exports.up = async function (knex) {
  await knex.schema.createTable('publishers', (table) => {
    table.string('id', 40).primary();
    table.string('name');
    table.dateTime('dateCreated', { precision: 2, useTz: false });
    table.dateTime('dateUpdated', { precision: 2, useTz: false });
    table.unique('name');
  });

  await knex.schema.createTable('publisher_custom_values', (table) => {
    table.string('name');
    table.string('publisherId', 40);
    table.string('value');
    table.foreign('publisherId').references('publishers.id');
    table.primary(['name', 'publisherId']);
  });

  const now = new Date();
  const hindawiId = uuid();
  const sageUKId = uuid();
  const sageUSId = uuid();
  const wileyId = uuid();
  const cupId = uuid();

  await knex('publishers').insert([
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
  ]);

  await knex.schema.table('catalog', (table) => {
    table.string('publisherId', 40).defaultTo(hindawiId).notNullable();
    table.foreign('publisherId').references('publishers.id');
  });

  await knex('publisher_custom_values').insert([
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
  ]);
};

module.exports.down = async function (knex) {
  await knex.schema.table('catalog', (table) => {
    table.dropColumn('publisherId');
  });
  await knex.schema.dropTable('publisher_custom_values');
  await knex.schema.dropTable('publishers');
};
