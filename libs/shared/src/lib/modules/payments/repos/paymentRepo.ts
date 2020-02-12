import { Repo } from '../../../infrastructure/Repo';
import { Payment } from '../domain/Payment';
import { PaymentId } from '../domain/PaymentId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export interface PaymentRepoContract extends Repo<Payment> {
  getPaymentById(paymentId: PaymentId): Promise<Payment>;
  getPaymentByInvoiceId(invoiceId: InvoiceId): Promise<Payment>;
  getPaymentsByInvoiceId(invoiceId: InvoiceId): Promise<Payment[]>;
  // getPaymentCollection(params: string[]): Promise<Payment[]>;
}
