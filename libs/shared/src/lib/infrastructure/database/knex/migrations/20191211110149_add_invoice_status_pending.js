const formatAlterTableEnumSql = (tableName, columnName, enums) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '"
    )}'::text]));`
  ].join('\n');
};

exports.up = async function(knex) {
  await knex.raw(
    formatAlterTableEnumSql('invoices', 'status', [
      'DRAFT',
      'PENDING',
      'ACTIVE',
      'FINAL'
    ])
  );
};

exports.down = async function(knex) {
  await knex.raw(
    formatAlterTableEnumSql('invoices', 'status', ['DRAFT', 'ACTIVE', 'FINAL'])
  );
};
