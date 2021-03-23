import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: payments');
  let queryStart = new Date();

  // * payments is dependent on invoice_data

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS payments
  AS
  SELECT
    last_inv.event_id,
    last_inv.invoice_id,
    last_inv.manuscript_custom_id,
    last_inv.reference_number,
    last_inv.invoice_issue_date,
    payment_view."paymentType" AS payment_type,
    payment_view."foreignPaymentId" AS payment_reference,
    cast_to_timestamp(payment_view. "paymentDate") AS payment_date,
    payment_view."paymentAmount"::float AS payment_amount
  FROM (SELECT ie.payload, last_inv.*	
    FROM (SELECT * FROM (SELECT *, ROW_NUMBER() OVER (partition by id.invoice_id ORDER BY case when id.status = 'FINAL' then 1 when id.status = 'ACTIVE' then 2 else 3 end, id.event_timestamp desc nulls last) AS rn FROM invoice_data id) i
      WHERE	rn = 1) last_inv
    JOIN ${REPORTING_TABLES.INVOICE} ie ON ie.id = last_inv.event_id
  ) last_inv, 
    jsonb_to_recordset(last_inv.payload -> 'payments')
      AS payment_view("foreignPaymentId" text, "paymentAmount" float, "paymentType" text, "paymentDate" text)
  WITH NO DATA;
  `);

  const postCreateQueries = [
    `CREATE index on payments (event_id)`,
    `CREATE index on payments (invoice_id)`,
    `CREATE index on payments (invoice_id, payment_date desc nulls last)`,
    `CREATE index on payments (payment_date desc nulls last)`,
    `CREATE index on payments (manuscript_custom_id)`,
    `CREATE index on payments (reference_number)`,
    `CREATE index on payments (payment_type)`,
  ];

  for (const indexQuery of postCreateQueries) {
    const indexQueryStart = new Date();
    await knex.raw(indexQuery);
    logger.debug(
      `Creating indices ${indexQuery} took ${differenceInSeconds(
        indexQueryStart
      )} seconds`
    );
  }

  logger.info(
    `Creating table and indices checker_to_submission took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210323144445_create_payments_mv.ts';
