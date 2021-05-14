exports.up = function(knex) {
  return knex('waivers')
    .insert(
      {
        type_id: 'WAIVED_COUNTRY_50',
        reduction: 50,
        isActive: true
      }
    ).onConflict('type_id').ignore();
};

exports.down = function(knex) {};
