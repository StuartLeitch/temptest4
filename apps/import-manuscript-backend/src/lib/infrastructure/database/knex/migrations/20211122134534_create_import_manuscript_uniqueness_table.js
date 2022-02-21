module.exports.up = async function(knex) {
  return knex.schema.createTable('imported_manuscripts', (table) => {
    table.string('id', 40).primary();
    table.string('fileName', 40);
    table.enum('status', ['upload-confirmed', 'validation-started', "error", 'submitted']);
    table.dateTime('dateCreated', { precision: 2, useTz: false }).defaultTo(knex.fn.now());
    table.dateTime('dateUpdated', { precision: 2, useTz: false }).defaultTo(knex.fn.now());
  });
};

module.exports.down = async function(knex) {
  return knex.schema.dropTable('imported_manuscripts');
};
