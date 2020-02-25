const uuid = require('uuid/v4');

module.exports.up = async function(knex) {
  await knex.schema.createTable('publishers', table => {
    table.string('id', 40).primary();
    table.string('name');
    table.dateTime('dateCreated', { precision: 2, useTz: false });
    table.dateTime('dateUpdated', { precision: 2, useTz: false });
    table.unique('name');
  });

  await knex.schema.createTable('publisher_custom_values', table => {
    table.string('name');
    table.string('publisherId', 40);
    table.string('value');
    table.foreign('publisherId').references('publishers.id');
    table.primary(['name', 'publisherId']);
  });

  const now = new Date();
  const hindawiId = uuid();
  const wileyId = uuid();

  await knex('publishers').insert([
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'Hindawi',
      id: hindawiId
    },
    {
      dateCreated: now,
      dateUpdated: now,
      name: 'Wiley',
      id: wileyId
    }
  ]);

  await knex.schema.table('catalog', table => {
    table
      .string('publisherId', 40)
      .defaultTo(hindawiId)
      .notNullable();
    table.foreign('publisherId').references('publishers.id');
  });

  await knex('publisher_custom_values').insert([
    {
      name: 'tradeDocumentItem',
      publisherId: hindawiId,
      value: '01t0Y000002BuB9QAK'
    },
    {
      name: 'tradeDocumentItem',
      publisherId: wileyId,
      value: '01t0Y000002BkzAQAS'
    },
    {
      name: 'journalReference',
      publisherId: hindawiId,
      value: 'Hindawi APC Recognition for article'
    },
    {
      name: 'journalReference',
      publisherId: wileyId,
      value: 'Wiley-Hindawi APC Recognition for article'
    },
    {
      name: 'journalItemReference',
      publisherId: hindawiId,
      value: 'Hindawi APC Recognition for article'
    },
    {
      name: 'journalItemReference',
      publisherId: wileyId,
      value: 'Wiley-Hindawi APC Recognition for article'
    },
    {
      name: 'journalTag',
      publisherId: hindawiId,
      value: 'a5L0Y000000g0EeUAI'
    },
    {
      name: 'journalTag',
      publisherId: wileyId,
      value: 'a5L0Y000000g0TMUAY'
    },
    {
      name: 'journalItemTag',
      publisherId: hindawiId,
      value: 'a5L0Y000000g0BmUAI'
    },
    {
      name: 'journalItemTag',
      publisherId: wileyId,
      value: 'a5L0Y000000fzUOUAY'
    }
  ]);
};

module.exports.down = async function(knex) {
  await knex.schema.table('catalog', table => {
    table.dropColumn('publisherId');
  });
  await knex.schema.dropTable('publisher_custom_values');
  await knex.schema.dropTable('publishers');
};
