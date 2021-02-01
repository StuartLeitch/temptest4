import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import invoiceDataView from './InvoicesDataView';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

class PaymentsView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
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
  FROM (SELECT * FROM (SELECT *, ROW_NUMBER() OVER (${invoiceDataView.getPartitionQuery(
    'id'
  )}) AS rn FROM ${invoiceDataView.getViewName()} id) i
    WHERE	rn = 1) last_inv
  JOIN ${REPORTING_TABLES.INVOICE} ie ON ie.id = last_inv.event_id
) last_inv, 
  jsonb_to_recordset(last_inv.payload -> 'payments')
    AS payment_view("foreignPaymentId" text, "paymentAmount" float, "paymentType" text, "paymentDate" text)
WITH NO DATA;
`;
  }

  getViewName(): string {
    return 'payments';
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (event_id)`,
    `create index on ${this.getViewName()} (invoice_id)`,
    `create index on ${this.getViewName()} (invoice_id, payment_date desc nulls last)`,
    `create index on ${this.getViewName()} (payment_date desc nulls last)`,
    `create index on ${this.getViewName()} (manuscript_custom_id)`,
    `create index on ${this.getViewName()} (reference_number)`,
    `create index on ${this.getViewName()} (payment_type)`,
  ];
}

const paymentsView = new PaymentsView();
paymentsView.addDependency(invoiceDataView);

export default paymentsView;
