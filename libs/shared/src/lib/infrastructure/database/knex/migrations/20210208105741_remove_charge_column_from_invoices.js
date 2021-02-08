exports.up = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.dropUnique('charge');
  });
};

exports.down = function(knex) {

};
