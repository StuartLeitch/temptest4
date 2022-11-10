module.exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE credit_notes DROP CONSTRAINT IF EXISTS "credit_notes_creationReason_check";
    ALTER TABLE credit_notes ADD CONSTRAINT "credit_notes_creationReason_check" CHECK ("creationReason" = ANY (ARRAY['withdrawn-manuscript'::text, 'reduction-applied'::text, 'waived-manuscript'::text, 'change-payer-details'::text, 'bad-debt'::text, 'ta-late-approval'::text, 'other'::text]));
  `)
};

module.exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE credit_notes DROP CONSTRAINT IF EXISTS "credit_notes_creationReason_check";
    ALTER TABLE credit_notes ADD CONSTRAINT "credit_notes_creationReason_check" CHECK ("creationReason" = ANY (ARRAY['withdrawn-manuscript'::text, 'reduction-applied'::text, 'waived-manuscript'::text, 'change-payer-details'::text, 'bad-debt'::text, 'other'::text]));
    `)
};
