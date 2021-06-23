import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { PaymentMethodRepoContract } from '../paymentMethodRepo';
import { PaymentMethod } from '../../domain/PaymentMethod';
import { PaymentMethodId } from '../../domain/PaymentMethodId';

export class MockPaymentMethodRepo
  extends BaseMockRepo<PaymentMethod>
  implements PaymentMethodRepoContract {
  constructor() {
    super();
  }

  public async getPaymentMethodById(
    paymentMethodId: PaymentMethodId
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const matches = this._items.filter((p) =>
      p.paymentMethodId.equals(paymentMethodId)
    );
    if (matches.length !== 0) {
      return right(matches[0]);
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'payment method',
          paymentMethodId.toString()
        )
      );
    }
  }

  public async getPaymentMethodByName(
    name: string
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const match = this._items.find((item) => item.name === name);
    if (match) {
      return right(match);
    } else {
      return left(RepoError.createEntityNotFoundError('payment method', name));
    }
  }

  public async getPaymentMethods(): Promise<
    Either<GuardFailure | RepoError, PaymentMethod[]>
  > {
    return right(this._items);
  }

  public async getPaymentMethodCollection(): Promise<
    Either<GuardFailure | RepoError, PaymentMethod[]>
  > {
    return right(this._items);
  }

  public async update(
    paymentMethod: PaymentMethod
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const maybeAlreadyExists = await this.exists(paymentMethod);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((p) => {
        if (this.compareMockItems(p, paymentMethod)) {
          return PaymentMethod;
        } else {
          return p;
        }
      });
    }

    return this.getPaymentMethodById(paymentMethod.paymentMethodId);
  }

  public async save(
    paymentMethod: PaymentMethod
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const maybeAlreadyExists = await this.exists(paymentMethod);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((p) => {
        if (this.compareMockItems(p, paymentMethod)) {
          return paymentMethod;
        } else {
          return p;
        }
      });
    } else {
      this._items.push(paymentMethod);
    }

    return this.getPaymentMethodById(paymentMethod.paymentMethodId);
  }

  public async delete(paymentMethod: PaymentMethod): Promise<boolean> {
    return true;
  }

  public async exists(
    paymentMethod: PaymentMethod
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((p) =>
      this.compareMockItems(p, paymentMethod)
    );
    return right(found.length !== 0);
  }

  public compareMockItems(a: PaymentMethod, b: PaymentMethod): boolean {
    return a.id.equals(b.id);
  }
}
