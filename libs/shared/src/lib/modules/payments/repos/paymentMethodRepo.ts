import { Repo } from '../../../infrastructure/Repo';
import { PaymentMethod } from '../domain/PaymentMethod';
import { PaymentMethodId } from '../domain/PaymentMethodId';

export interface PaymentMethodRepoContract extends Repo<PaymentMethod> {
  getPaymentMethodById(
    paymentMethodId: PaymentMethodId
  ): Promise<PaymentMethod>;
  getPaymentMethodCollection(): Promise<PaymentMethod[]>;
}
