exports.up = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.dropColumn('charge');
  });
};

exports.down = function(knex) {

};
