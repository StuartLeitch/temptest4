/* eslint-disable no-undef */

const tableName = 'articles';
const oldColumn = 'arxivId';
const newColumn = 'preprintValue';

module.exports.up = function (knex) {
  return knex.schema
    .table(tableName, (table) => {
      table.string(newColumn).nullable();
    })
    .then(() => {
      return knex(tableName).update({
        [newColumn]: knex.raw(`??`, [oldColumn]),
      });
    })
    .then(() => {
      return knex.schema.table(tableName, (table) => {
        table.dropColumn(oldColumn);
      });
    });
};

module.exports.down = (knex) => {
  return knex.schema
    .table(tableName, (table) => {
      table.string(oldColumn).nullable();
    })
    .then(() =>
      knex(tableName).update({
        [oldColumn]: knex.raw(`??`, [newColumn]),
      })
    )
    .then(() =>
      knex.schema.table(tableName, (table) => {
        table.dropColumn(newColumn);
      })
    );
};
