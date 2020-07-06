/* eslint-disable */
const { v4 } = require('uuid');

const formatAlterTableEnumSql = (tableName, columnName, enums) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '"
    )}'::text]));`,
  ].join('\n');
};

module.exports.up = async function (knex) {
  return await knex.raw(
    formatAlterTableEnumSql('payments', 'status', [
      'PENDING',
      'FAILED',
      'COMPLETED',
      'CREATED',
    ])
  );
};

module.exports.down = async function (knex) {
  return await knex.raw(
    formatAlterTableEnumSql('payments', 'status', [
      'PENDING',
      'FAILED',
      'COMPLETED',
    ])
  );
};
