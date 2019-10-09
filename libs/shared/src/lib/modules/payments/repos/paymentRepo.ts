import {Repo} from '../../../../core/infra/Repo';
import {Payment} from '../../domain/Payment';
import {PaymentId} from '../../domain/PaymentId';

export interface PaymentRepoContract extends Repo<Payment> {
  getPaymentById(paymentId: PaymentId): Promise<Payment>;
  // getPaymentCollection(params: string[]): Promise<Payment[]>;
}
