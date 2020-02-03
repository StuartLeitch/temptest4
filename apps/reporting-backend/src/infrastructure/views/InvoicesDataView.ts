import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract
} from './contracts/EventViewContract';

class InvoicesDataView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW ${this.getViewName()}
AS SELECT invoice_events.type AS event,
    invoice_events.payload ->> 'invoiceId'::text AS invoice_id,
    invoice_events.payload ->> 'invoiceStatus'::text AS status,
    (invoice_events.payload ->> 'invoiceCreatedDate'::text)::timestamp without time zone AS manuscript_accepted_date,
    (invoice_events.payload ->> 'invoiceIssueDate'::text)::timestamp without time zone AS invoice_issue_date,
    (invoice_events.payload ->> 'created'::text)::timestamp without time zone AS created_date,
    ((invoice_events.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
    invoice_events.payload ->> 'referenceNumber'::text AS reference_number,
    (((invoice_events.payload -> 'invoiceItems'::text) -> 0) ->> 'price'::text)::float AS apc_value,
    (((invoice_events.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::integer AS vat_percentage
   FROM ${REPORTING_TABLES.INVOICE}
WITH DATA;
    `;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (status)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (event)`
  ];

  getViewName(): string {
    return 'invoices_data';
  }
}

const invoiceDataView = new InvoicesDataView();

export default invoiceDataView;
