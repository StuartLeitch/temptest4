exports.up = function(knex) {
  return knex.schema.table('articles', function(table) {
    table.renameColumn('articleTypeId', 'articleType');
  });
};

exports.down = function(knex, Promise) {};
