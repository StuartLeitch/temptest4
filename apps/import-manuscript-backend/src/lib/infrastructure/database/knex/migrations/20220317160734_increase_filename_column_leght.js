module.exports.up = async function(knex) {
  return knex.raw('alter table ?? alter column ?? type VARCHAR(255)', ['imported_manuscripts', 'fileName']);
};

module.exports.down = async function(knex) {
  return knex.schema.dropTable('imported_manuscripts');
};
