/* eslint-disable no-undef */
module.exports.up = async function (knex) {
  await knex
    .table('invoices')
    .whereNot({ status: 'FINAL' })
    .update({ dateMovedToFinal: null });

  await knex.raw(`
    UPDATE
      invoices
    SET
      "dateAccepted" = sub.newDateAccepted
    FROM
      (
        SELECT
          *
        FROM
          (
            WITH selected AS (
              SELECT
                inv.id,
                inv."transactionId" AS tId,
                ROW_NUMBER() OVER(
                  PARTITION BY inv."transactionId"
                  ORDER BY
                    inv."dateAccepted" DESC
                ) AS rk
              FROM
                invoices inv
              WHERE
                "transactionId" IN (
                  SELECT
                    "transactionId"
                  FROM
                    invoices
                  WHERE
                    "cancelledInvoiceReference" IS NOT NULL
                )
            )
            SELECT
              s.id,
              s.tId
            FROM
              selected s
            WHERE
              s.rk = 1
          ) AS toUpdate
          JOIN (
            SELECT
              i."transactionId" AS cnTId,
              i."dateAccepted" AS newDateAccepted
            FROM
              invoices i
            WHERE
              "cancelledInvoiceReference" IS NOT NULL
          ) AS cn ON toUpdate.tId = cn.cnTId
      ) AS sub
    WHERE
      invoices.id = sub.id
  `);
};

module.exports.down = function (knex) {
  return null;
};
