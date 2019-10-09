export const up = function(knex) {
  const moneyType = {
    symbol: '$',
    name: 'US Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'USD',
    name_plural: 'US dollars'
  };
  return knex.schema.createTable('catalog', function(table) {
    table.uuid('id').primary();
    table.string('type');
    table.integer('count');
    // table.number('price');
    table.datetime('created', {precision: 2, useTz: false});
    table.datetime('updated', {precision: 2, useTz: false});
    table.specificType('price', moneyType);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('catalog');
};
