import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';

class InvoicesDataView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT ie.id as event_id,
    ie.type AS event,
    ((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
    ie.payload ->> 'invoiceId'::text AS invoice_id,
    ie.payload ->> 'invoiceStatus'::text AS status,
    (ie.payload ->> 'invoiceCreatedDate'::text)::timestamp without time zone AS manuscript_accepted_date,
    (ie.payload ->> 'invoiceIssueDate'::text)::timestamp without time zone AS invoice_issue_date,
    (ie.payload ->> 'created'::text)::timestamp without time zone AS created_date,
    ie.payload ->> 'referenceNumber'::text AS reference_number,
    (((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'price'::text)::float AS gross_apc_value,
    COALESCE((((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::float, 0) AS vat_percentage,
    COALESCE((ie.payload ->> 'valueWithoutVAT'::text)::float, (ie.payload ->> 'paymentAmount'::text)::float / (1 + (((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::float / 100)) AS net_apc,
    (ie.payload ->> 'paymentAmount'::text)::float AS paid_amount,
    (ie.payload ->> 'paymentDate'::text)::timestamp without time zone AS payment_date,
    (ie.payload ->> 'foreignPaymentId'::text) AS payment_reference,
    (ie.payload ->> 'payerName'::text) AS payer_given_name,
    (ie.payload ->> 'payerEmail'::text) AS payer_email,
    (ie.payload ->> 'paymentType'::text) AS payment_type,
    (ie.payload ->> 'country'::text) AS payer_country,
    COALESCE((ie.payload ->> 'currency'::text), 'USD') as payment_currency
   FROM ${REPORTING_TABLES.INVOICE} ie
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (invoice_id)`,
    `create index on ${this.getViewName()} (status)`,
    `create index on ${this.getViewName()} (manuscript_accepted_date)`,
    `create index on ${this.getViewName()} (invoice_issue_date)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (event)`
  ];

  getViewName(): string {
    return 'invoices_data';
  }
}

const invoiceDataView = new InvoicesDataView();

export default invoiceDataView;
