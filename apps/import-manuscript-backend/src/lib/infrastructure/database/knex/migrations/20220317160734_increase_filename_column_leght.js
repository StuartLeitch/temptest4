module.exports.up = async function(knex) {
  return knex.raw('alter table ?? alter column ?? type VARCHAR(255)', ['imported_manuscripts', 'fileName']);
};

exports.down = function(knex, Promise) {};
