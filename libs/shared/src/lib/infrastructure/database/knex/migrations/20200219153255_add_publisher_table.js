module.exports.up = async function(knex) {
  await knex.schema.createTable('publishers', table => {
    table.string('id', 40).primary();
    table.string('name');
    table.unique('name');
  });

  await knex.schema.createTable('publisher_custom_values', table => {
    table.string('name');
    table.string('publisherId', 40);
    table.string('value');
    table.foreign('publisherId').references('publishers.id');
    table.primary(['name', 'publisherId']);
  });

  await knex('publishers').insert([
    {
      id: '1',
      name: 'Hindawi'
    },
    {
      id: '2',
      name: 'Wiley'
    }
  ]);

  await knex.schema.table('catalog', table => {
    table
      .string('publisherId', 40)
      .defaultTo(1)
      .notNullable();
    table.foreign('publisherId').references('publishers.id');
  });

  await knex('publisher_custom_values').insert([
    {
      name: 's2cor__Sage_ACC_Journal__c.s2cor__Reference__c',
      publisherId: '1',
      value: 'Wiley-Hindawi APC Recognition for article'
    },
    {
      name: 's2cor__Sage_ACC_Journal__c.s2cor__Reference__c',
      publisherId: '2',
      value: 'Hindawi APC Recognition for article'
    },
    {
      name: 's2cor__Sage_ACC_Journal_Item__c.s2cor__Reference__c',
      publisherId: '1',
      value: 'Hindawi APC Recognition for article'
    },
    {
      name: 's2cor__Sage_ACC_Journal_Item__c.s2cor__Reference__c',
      publisherId: '2',
      value: 'Wiley-Hindawi APC Recognition for article'
    },
    {
      name: 's2cor__Sage_ACC_Journal_Tag__c.s2cor__Tag__c',
      publisherId: '1',
      value: 'a5L0Y000000g0EeUAI'
    },
    {
      name: 's2cor__Sage_ACC_Journal_Tag__c.s2cor__Tag__c',
      publisherId: '2',
      value: 'a5L0Y000000g0TMUAY'
    },
    {
      name: 's2cor__Sage_ACC_Journal_Item_Tag__c.s2cor__Tag__c',
      publisherId: '1',
      value: 'a5L0Y000000PFE7UAO'
    },
    {
      name: 's2cor__Sage_ACC_Journal_Item_Tag__c.s2cor__Tag__c',
      publisherId: '2',
      value: 'a5L0Y000000fzUOUAY'
    },
    {
      name: 'S2cor__Sage_INV_Trade_Document_Item__c.s2cor__Product__c',
      publisherId: '1',
      value: '01t0Y000002BuB9QAK'
    },
    {
      name: 'S2cor__Sage_INV_Trade_Document_Item__c.s2cor__Product__c',
      publisherId: '2',
      value: '01t0Y000002BkzAQAS'
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
