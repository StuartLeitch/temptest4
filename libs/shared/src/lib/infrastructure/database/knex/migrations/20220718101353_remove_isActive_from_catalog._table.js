module.exports.up = function (knex) {
  return knex.schema.table('catalog', function (table) {
    table.dropColumn('isActive');
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('catalog', function (table) {
    table.boolean('isActive').notNullable().default(true);
  });
};
