/* eslint-disable no-undef */
module.exports.up = function (knex) {
  return knex.schema
    .table('erp_references', (table) =>
      table.index(
        ['entity_id', 'vendor', 'attribute', 'value'],
        'erp_references_value_idx'
      )
    )
    .then(() => {
      return knex.raw(
        'CREATE INDEX article_datePublished_idx ON articles (("datePublished"::DATE))'
      );
    });
};

module.exports.down = function (knex) {
  // * do nothing yet
};
