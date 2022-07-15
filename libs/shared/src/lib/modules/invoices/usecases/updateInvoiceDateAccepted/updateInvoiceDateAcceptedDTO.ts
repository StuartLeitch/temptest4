import { InvoiceId } from '../../domain/InvoiceId';

export interface UpdateInvoiceDateAcceptedDTO {
  invoiceId: InvoiceId;
  dateAccepted: string;
}
