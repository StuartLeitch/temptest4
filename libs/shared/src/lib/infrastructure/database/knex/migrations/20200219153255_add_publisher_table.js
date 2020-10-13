/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

module.exports.up = async function (knex) {
  await knex.schema.createTable('publishers', (table) => {
    table.string('id', 40).primary();
    table.string('name');
    table.dateTime('dateCreated', { precision: 2, useTz: false });
    table.dateTime('dateUpdated', { precision: 2, useTz: false });
    table.unique('name');
  });

  await knex.schema.table('catalog', (table) => {
    table.string('publisherId', 40).notNullable();
    table.foreign('publisherId').references('publishers.id');
  });

  await knex.schema.createTable('publisher_custom_values', (table) => {
    table.string('name');
    table.string('publisherId', 40);
    table.string('value');
    table
      .foreign('publisherId')
      .references('publishers.id')
      .onDelete('CASCADE');
    table.primary(['name', 'publisherId']);
  });
};

module.exports.down = async function (knex) {
  await knex.schema.table('catalog', (table) => {
    table.dropColumn('publisherId');
  });
  await knex.schema.dropTable('publisher_custom_values');
  await knex.schema.dropTable('publishers');
};
