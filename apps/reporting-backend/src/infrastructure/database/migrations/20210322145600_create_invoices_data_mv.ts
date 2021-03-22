import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: invoices_data');
  let queryStart = new Date();

  await knex.raw(`
  CREATE MATERIALIZED VIEW IF NOT EXISTS invoices_data
  AS SELECT ie.id as event_id,
      ie.type AS event,
      ie.time as event_timestamp,
      ((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
      ie.payload ->> 'invoiceId'::text AS invoice_id,
      ie.payload ->> 'invoiceStatus'::text AS status,
      cast_to_timestamp(ie.payload ->> 'invoiceCreatedDate'::text) AS invoice_created_date,
      cast_to_timestamp(ie.payload ->> 'invoiceIssuedDate'::text) AS invoice_issue_date,
      cast_to_timestamp(ie.payload ->> 'manuscriptAcceptedDate'::text) AS manuscript_accepted_date,
      cast_to_timestamp(ie.payload ->> 'updated'::text) AS updated_date,
      ie.payload ->> 'referenceNumber'::text AS reference_number,
      coalesce((ie.payload ->> 'isCreditNote'::text)::boolean, false) AS is_credit_note,
      ie.payload ->> 'creditNoteForInvoice'::text AS cancelled_invoice_reference,
      ((ie.payload -> 'costs' ->> 'grossApc'))::float as gross_apc_value,
      COALESCE((((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage')::float, 0) AS vat_percentage,
      ((ie.payload -> 'costs' ->> 'netApc'))::float as net_apc,
      ((ie.payload -> 'costs' ->> 'netAmount'))::float as net_amount,
      ((ie.payload -> 'costs' ->> 'vatAmount'))::float as vat_amount,
      ((ie.payload -> 'costs' ->> 'totalDiscount'))::float as discount,
      ((ie.payload -> 'costs' ->> 'dueAmount'))::float as due_amount,
      ((ie.payload -> 'costs' ->> 'paidAmount'))::float as paid_amount,
      cast_to_timestamp(ie.payload ->> 'lastPaymentDate'::text) AS payment_date,
      COALESCE((ie.payload ->> 'currency'::text), 'USD') as payment_currency,
      (ie.payload -> 'payments' -> 0 ->> 'paymentType'::text) AS payment_type,
      CONCAT((ie.payload -> 'payer' ->> 'firstName'::text), ' ', (ie.payload -> 'payer' ->> 'lastName'::text))  AS payer_given_name,
      (ie.payload -> 'payer' ->> 'email'::text) AS payer_email,
      (ie.payload -> 'payer' ->> 'countryCode'::text) AS payer_country,
      (ie.payload -> 'payer' ->> 'billingAddress'::text) AS payer_address,
      (ie.payload -> 'payer' ->> 'organization'::text) as organization
     FROM ${REPORTING_TABLES.INVOICE} ie
  WITH NO DATA;
    `
  );

  const postCreateQueries = [
    `CREATE index ON invoices_data (invoice_id)`,
    `CREATE index ON invoices_data (invoice_id, event_timestamp, updated_date)`,
    `CREATE index ON invoices_data (event_timestamp)`,
    `CREATE index ON invoices_data (status)`,
    `CREATE index ON invoices_data (invoice_created_date)`,
    `CREATE index ON invoices_data (invoice_issue_date)`,
    `CREATE index ON invoices_data (manuscript_custom_id)`,
    `CREATE index ON invoices_data (manuscript_custom_id, event, event_timestamp)`,
    `CREATE index ON invoices_data (reference_number)`,
    `CREATE index ON invoices_data (cancelled_invoice_reference)`,
    `CREATE index ON invoices_data (event_id)`,
    `CREATE index ON invoices_data (event)`,
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
    `Creating table and indices invoices_data took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210322145600_create_invoices_data_mv.ts';
