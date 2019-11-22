
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('configurations').del()
    .then(function () {
      // Inserts seed entries
      return knex('configurations').insert([
        {invoiceReferenceNumber: 90000},
      ]);
    });
};
