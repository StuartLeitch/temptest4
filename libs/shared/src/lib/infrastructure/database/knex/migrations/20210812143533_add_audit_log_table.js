module.exports.up = async function(knex) {
  return knex.schema
    .createTable('audit_logs', function(table) {
      table.string('id', 40).primary();
      table.string('user_account', 40);
      table.string('entity', 40);
      table.string('action', 40);
      table.datetime('timestamp', { precision: 2, useTz: false });
    });
};

module.exports.down = async function(knex) {
  //await knex.raw('DROP EXTENSION IF EXISTS "uuid"')
  knex.schema.dropTable('audit_logs');
};
