exports.up = function(knex) {
  return knex.schema.table('waivers', function(table) {
    table.dropColumn('invoiceId');
    table.dropColumn('type');
    table.dropColumn('percentage');
    table.dropPrimary();
    table.dropColumn('id');
    table.string('type_id', 40).primary();
    table.float('reduction');
    table.boolean('isActive').defaultsTo(false);
    table.json('metadata').defaultsTo({});
  });
};

exports.down = function(knex) {
  return knex.schema.table('waivers', function(table) {
    table.dropColumn('isActive');
    table.dropColumn('metadata');
  });
};
