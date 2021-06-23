import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { ExternalOrderId } from '../domain/external-order-id';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PaymentId } from '../domain/PaymentId';
import { Payment } from '../domain/Payment';

export interface PaymentRepoContract extends Repo<Payment> {
  getPaymentById(paymentId: PaymentId): Promise<Either<GuardFailure | RepoError, Payment>>;
  getPaymentByInvoiceId(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError, Payment>>;
  getPaymentsByInvoiceId(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError, Payment[]>>;
  updatePayment(payment: Payment): Promise<Either<GuardFailure | RepoError, Payment>>;
  getPaymentByForeignId(foreignPaymentId: ExternalOrderId): Promise<Either<GuardFailure | RepoError, Payment>>;
  getUnregisteredErpPayments(): Promise<PaymentId[]>;
}
