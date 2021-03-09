import { Repo } from '../../../infrastructure/Repo';

import { ExternalOrderId } from '../domain/external-order-id';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PaymentId } from '../domain/PaymentId';
import { Payment } from '../domain/Payment';

export interface PaymentRepoContract extends Repo<Payment> {
  getPaymentById(paymentId: PaymentId): Promise<Payment>;
  getPaymentByInvoiceId(invoiceId: InvoiceId): Promise<Payment>;
  getPaymentsByInvoiceId(invoiceId: InvoiceId): Promise<Payment[]>;
  updatePayment(payment: Payment): Promise<Payment>;
  getPaymentByForeignId(foreignPaymentId: ExternalOrderId): Promise<Payment>;
  getUnregisteredErpPayments(): Promise<PaymentId[]>;
}
