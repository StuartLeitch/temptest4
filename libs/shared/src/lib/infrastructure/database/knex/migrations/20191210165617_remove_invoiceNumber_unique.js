
exports.up = function(knex) {
  return knex.schema.table('invoices', function(table) {
    table.dropUnique('invoiceNumber');
  });
};

exports.down = function(knex) {
  
};
