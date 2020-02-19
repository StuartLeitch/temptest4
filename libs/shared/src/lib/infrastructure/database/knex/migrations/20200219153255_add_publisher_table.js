module.exports.up = async function(knex) {
  await knex.schema.createTable('publishers', table => {
    table.string('id', 40).primary();
    table.string('name');
  });

  await knex.schema.createTable('publisher_custom_values', table => {
    table.string('name');
    table.string('publisherId', 40);
    table.string('value');
    table.foreign('publisherId').references('publishers.id');
    table.primary(['name', 'publisherId']);
  });

  await knex.schema.table('catalog', table => {
    table.string('publisherId', 40);
    table.foreign('publisherId').references('publishers.id');
  });
};

module.exports.down = async function(knex) {
  await knex.schema.table('catalog', table => {
    table.dropColumn('publisherId');
  });
  await knex.schema.dropTable('publisher_custom_values');
  await knex.schema.dropTable('publishers');
};
