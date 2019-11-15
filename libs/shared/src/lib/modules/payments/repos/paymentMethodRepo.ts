import { Repo } from '../../../infrastructure/Repo';
import { PaymentMethod } from '../domain/PaymentMethod';
import { PaymentMethodId } from '../domain/PaymentMethodId';

export interface PaymentMethodRepoContract extends Repo<PaymentMethod> {
  getPaymentMethodById(
    paymentMethodId: PaymentMethodId
  ): Promise<PaymentMethod>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  // getPaymentMethodCollection(params: string[]): Promise<PaymentMethod[]>;
}
