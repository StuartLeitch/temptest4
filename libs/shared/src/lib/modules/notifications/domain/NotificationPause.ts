import { InvoiceId } from '../../invoices/domain/InvoiceId';

export interface NotificationPause {
  invoiceId: InvoiceId;
  confirmation: boolean;
  payment: boolean;
}
