module.exports.up = async function(knex) {
  await knex.raw(
    'ALTER TABLE "catalog" ALTER COLUMN "journalTitle" SET DATA TYPE text'
  );
  await knex.raw(
    'ALTER TABLE "articles" ALTER COLUMN "title" SET DATA TYPE text'
  );
  await knex.raw(
    'ALTER TABLE "articles" ALTER COLUMN "authorFirstName" SET DATA TYPE varchar(255)'
  );
  await knex.raw(
    'ALTER TABLE "addresses" ALTER COLUMN "addressLine1" SET DATA TYPE text'
  );
  await knex.raw(
    'ALTER TABLE "addresses" ALTER COLUMN "addressLine2" SET DATA TYPE text'
  );
};

module.exports.down = async function(knex) {
  await knex.raw(
    'ALTER TABLE "catalog" ALTER COLUMN "journalTitle" SET DATA TYPE varchar(255)'
  );
  await knex.raw(
    'ALTER TABLE "articles" ALTER COLUMN "title" SET DATA TYPE varchar(255)'
  );
  await knex.raw(
    'ALTER TABLE "articles" ALTER COLUMN "authorFirstName" SET DATA TYPE varchar(40)'
  );
  await knex.raw(
    'ALTER TABLE "addresses" ALTER COLUMN "addressLine1" SET DATA TYPE varchar(255)'
  );
  await knex.raw(
    'ALTER TABLE "addresses" ALTER COLUMN "addressLine2" SET DATA TYPE varchar(255)'
  );
};
