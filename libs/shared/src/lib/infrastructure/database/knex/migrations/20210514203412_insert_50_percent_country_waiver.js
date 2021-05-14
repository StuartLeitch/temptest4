exports.up = function(knex) {
  return knex
    .insert([
      {
        type_id: 'WAIVED_COUNTRY_50',
        reduction: 50,
        isActive: true
      }
    ])
    .into('waivers');
};

exports.down = function(knex) {};
