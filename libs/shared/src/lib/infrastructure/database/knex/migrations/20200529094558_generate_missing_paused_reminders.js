/* eslint-disable no-undef */
module.exports.up = async function (knex) {
  return knex.raw(`
  INSERT INTO paused_reminders ("invoiceId", "pauseConfirmation", "pausePayment")
  SELECT
    i.id,
    FALSE,
    FALSE
  FROM
    invoices i
    LEFT JOIN paused_reminders p ON i.id = p."invoiceId"
  WHERE p."invoiceId" IS NULL`);
};

module.exports.down = function (knex) {
  return null;
};
