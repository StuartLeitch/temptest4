exports.up = function(knex) {
  return knex.schema.table('catalog', function(table) {
    table.integer('isActive').defaultsTo(0);
  }).then(() => knex('catalog').update({isActive: 1}));
};

exports.down = function(knex) {
  return knex.schema.table('catalog', function(table) {
    table.dropColumn('isActive');
  });
};
