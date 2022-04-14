const tableName = 'imported_manuscripts'
module.exports.up = async function(knex) {
  let existsRows;
  return knex.select()
    .from(tableName)
    .then((rows) =>{
      existsRows = rows
      return knex.schema.table(tableName, (table) => table.dropColumn('status'))
      })
    .then(() => knex.schema.table(tableName, (table) => table.enum('status', ['VALIDATION_STARTED', 'UPLOAD_CONFIRMED', "SUBMITTED", 'ERROR'])))
    .then(() => {
      return Promise.all(existsRows.map((row) => {
        row.status.toUpperCase().replace("-", "_")
        return knex.table(tableName)
          .update({ status : row.status})
          .where('id', row.id)
      }))
    })
};

module.exports.down = async function(knex) {
  let existsRows;
  return knex.select()
    .from(tableName)
    .then((rows) =>{
      existsRows = rows
      return knex.schema.table(tableName, (table) => table.dropColumn('status'))
    })
    .then(() => knex.schema.table(tableName, (table) => table.enum('status', ['upload-confirmed', 'validation-started', "error", 'submitted'])))
    .then(() => {
      return Promise.all(existsRows.map((row) => {
        return knex.table(tableName)
          .update({ status : row.status})
          .where('id', row.id)
      }))
    })
};
