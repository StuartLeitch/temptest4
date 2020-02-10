import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { PaymentMethodRepoContract } from '../paymentMethodRepo';
import { PaymentMethod } from '../../domain/PaymentMethod';
import { PaymentMethodId } from '../../domain/PaymentMethodId';

export class MockPaymentMethodRepo extends BaseMockRepo<PaymentMethod>
  implements PaymentMethodRepoContract {
  constructor() {
    super();
  }

  public async getPaymentMethodById(
    paymentMethodId: PaymentMethodId
  ): Promise<PaymentMethod> {
    const matches = this._items.filter(p =>
      p.paymentMethodId.equals(paymentMethodId)
    );
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getPaymentMethodByName(name: string): Promise<PaymentMethod> {
    const match = this._items.find(item => item.name === name);
    return match ? match : null;
  }

  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this._items;
  }

  public async getPaymentMethodCollection() {
    return this._items;
  }

  public async update(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    const alreadyExists = await this.exists(paymentMethod);

    if (alreadyExists) {
      this._items.map(p => {
        if (this.compareMockItems(p, paymentMethod)) {
          return PaymentMethod;
        } else {
          return p;
        }
      });
    }

    return paymentMethod;
  }

  public async save(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    const alreadyExists = await this.exists(paymentMethod);

    if (alreadyExists) {
      this._items.map(p => {
        if (this.compareMockItems(p, paymentMethod)) {
          return paymentMethod;
        } else {
          return p;
        }
      });
    } else {
      this._items.push(paymentMethod);
    }

    return paymentMethod;
  }

  public async delete(paymentMethod: PaymentMethod): Promise<boolean> {
    return true;
  }

  public async exists(paymentMethod: PaymentMethod): Promise<boolean> {
    const found = this._items.filter(p =>
      this.compareMockItems(p, paymentMethod)
    );
    return found.length !== 0;
  }

  public compareMockItems(a: PaymentMethod, b: PaymentMethod): boolean {
    return a.id.equals(b.id);
  }
}
