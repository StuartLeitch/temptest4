/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

module.exports.up = async function (knex) {
  await knex.schema.createTable('erp_references', (table) => {
    table.string('entity_id', 40);
    table.string('type', 40);
    table.string('vendor', 40);
    table.string('attribute');
    table.string('value');
  });
};

module.exports.down = async function (knex) {
  await knex.schema.dropTable('erp_references');
};
