exports.up = function(knex) {
  return knex
    .insert([
      {
        type_id: 'WAIVED_COUNTRY',
        reduction: 100,
        isActive: true
      },
      {
        type_id: 'WAIVED_CHIEF_EDITOR',
        reduction: 100,
        isActive: true
      },
      {
        type_id: 'WAIVED_EDITOR',
        reduction: 100,
        isActive: true
      },
      {
        type_id: 'SANCTIONED_COUNTRY',
        reduction: 100,
        isActive: true
      },
      {
        type_id: 'EDITOR_DISCOUNT',
        reduction: 50,
        isActive: true
      }
    ])
    .into('waivers');
};

exports.down = function(knex) {};
