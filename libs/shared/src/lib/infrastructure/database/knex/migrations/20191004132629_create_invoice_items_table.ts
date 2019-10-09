export const up = function(knex: any) {
  return knex.schema.createTable('invoice_items', function(table) {
    table.uuid('id', 36).primary();
    table.string('invoiceId', 40);
    table.string('name', 40);
    table.string('type').defaultTo('APC');
    table.float('price');
  });
};

export const down = (knex: any) => ({});
