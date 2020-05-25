import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';

class InvoicesDataView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT ie.id as event_id,
    ie.type AS event,
    ie.time as event_timestamp,
    ((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
    ie.payload ->> 'invoiceId'::text AS invoice_id,
    ie.payload ->> 'invoiceStatus'::text AS status,
    cast_to_timestamp(ie.payload ->> 'invoiceCreatedDate'::text) AS invoice_created_date,
    cast_to_timestamp(ie.payload ->> 'invoiceIssueDate'::text) AS invoice_issue_date,
    cast_to_timestamp(ie.payload ->> 'updated'::text) AS updated_date,
    ie.payload ->> 'referenceNumber'::text AS reference_number,
    coalesce((ie.payload ->> 'isCreditNote'::text)::boolean, false) AS is_credit_note,
    ie.payload ->> 'cancelledInvoiceReference'::text AS cancelled_invoice_reference,
    ((ie.payload -> 'costs' -> 'grossApc')::text)::float as gross_apc_value,
    COALESCE((((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::float, 0) AS vat_percentage,
    ((ie.payload -> 'costs' -> 'netApc')::text)::float as net_apc,
    ((ie.payload -> 'costs' -> 'netAmount')::text)::float as net_amount,
    ((ie.payload -> 'costs' -> 'vatAmount')::text)::float as vat_amount,
    ((ie.payload -> 'costs' -> 'totalDiscount')::text)::float as discount,
    ((ie.payload -> 'costs' -> 'dueAmount')::text)::float as due_amount,
    ((ie.payload -> 'costs' -> 'paidAmount')::text)::float as paid_amount,
    cast_to_timestamp(ie.payload ->> 'lastPaymentDate'::text) AS payment_date,
    COALESCE((ie.payload ->> 'currency'::text), 'USD') as payment_currency,

    (ie.payload -> 'payments' -> 0 ->> 'paymentType'::text) AS payment_type,

    CONCAT((ie.payload -> 'payer' ->> 'firstName'::text), ' ', (ie.payload -> 'payer' ->> 'lastName'::text))  AS payer_given_name,
    (ie.payload -> 'payer' ->> 'email'::text) AS payer_email,
    (ie.payload -> 'payer' ->> 'countryCode'::text) AS payer_country,
    (ie.payload -> 'payer' ->> 'billingAddress'::text) AS payer_address,
    (ie.payload -> 'payer' ->> 'organization'::text) as organization
   FROM ${REPORTING_TABLES.INVOICE} ie
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (invoice_id)`,
    `create index on ${this.getViewName()} (invoice_id, event_timestamp, updated_date)`,
    `create index on ${this.getViewName()} (event_timestamp)`,
    `create index on ${this.getViewName()} (status)`,
    `create index on ${this.getViewName()} (invoice_created_date)`,
    `create index on ${this.getViewName()} (invoice_issue_date)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (reference_number)`,
    `create index on ${this.getViewName()} (cancelled_invoice_reference)`,
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event)`,
  ];

  getViewName(): string {
    return 'invoices_data';
  }

  getPartitionQuery(invoiceDataAlias = 'id'): string {
    return `partition by ${invoiceDataAlias}.invoice_id ORDER BY case when ${invoiceDataAlias}.status = 'FINAL' then 1 when ${invoiceDataAlias}.status = 'ACTIVE' then 2 else 3 end, ${invoiceDataAlias}.event_timestamp desc nulls last`;
  }
}

const invoiceDataView = new InvoicesDataView();

export default invoiceDataView;
