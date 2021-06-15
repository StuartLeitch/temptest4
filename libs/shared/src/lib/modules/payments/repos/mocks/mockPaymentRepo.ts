import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { PaymentRepoContract } from '../paymentRepo';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { ExternalOrderId } from '../../domain/external-order-id';
import { PaymentId } from '../../domain/PaymentId';
import { Payment } from '../../domain/Payment';

export class MockPaymentRepo
  extends BaseMockRepo<Payment>
  implements PaymentRepoContract {
  constructor() {
    super();
  }

  public async getPaymentById(
    paymentId: PaymentId
  ): Promise<Either<GuardFailure | RepoError, Payment>> {
    const matches = this._items.filter((p) => p.paymentId.equals(paymentId));
    if (matches.length !== 0) {
      return right(matches[0]);
    } else {
      return left(
        RepoError.createEntityNotFoundError('payment', paymentId.toString())
      );
    }
  }

  public async getPaymentByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Payment>> {
    const match = this._items.find((item) => item.invoiceId.equals(invoiceId));
    if (match) {
      return right(match);
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'payment by invoice id',
          invoiceId.toString()
        )
      );
    }
  }

  public async getPaymentsByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Payment[]>> {
    const match = this._items.filter((item) =>
      item.invoiceId.equals(invoiceId)
    );
    return right(match);
  }

  public async getUnregisteredErpPayments(): Promise<InvoiceId[]> {
    return null;
  }

  public async update(payment: Payment): Promise<Payment> {
    const maybeAlreadyExists = await this.exists(payment);

    if (maybeAlreadyExists.isLeft()) {
      throw RepoError.fromDBError(new Error(maybeAlreadyExists.value.message));
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((p) => {
        if (this.compareMockItems(p, payment)) {
          return Payment;
        }
        return p;
      });
    }

    return payment;
  }

  async getPaymentByForeignId(
    foreignPaymentId: ExternalOrderId
  ): Promise<Either<GuardFailure | RepoError, Payment>> {
    const result = this._items.find((item) =>
      item.foreignPaymentId.equals(foreignPaymentId)
    );

    if (!result) {
      return left(
        RepoError.createEntityNotFoundError(
          'payment by foreignPaymentId',
          foreignPaymentId.toString()
        )
      );
    }

    return right(result);
  }

  public async updatePayment(
    payment: Payment
  ): Promise<Either<GuardFailure | RepoError, Payment>> {
    const maybeAlreadyExists = await this.exists(payment);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (!alreadyExists) {
      throw RepoError.createEntityNotFoundError(
        'payment',
        payment.id.toString()
      );
    }

    const index = this._items.findIndex((p) => p.id.equals(payment.id));

    this._items[index] = payment;

    return this.getPaymentById(payment.paymentId);
  }

  public async save(
    payment: Payment
  ): Promise<Either<GuardFailure | RepoError, Payment>> {
    const maybeAlreadyExists = await this.exists(payment);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((p) => {
        if (this.compareMockItems(p, payment)) {
          return payment;
        } else {
          return p;
        }
      });
    } else {
      this._items.push(payment);
    }

    return this.getPaymentById(payment.paymentId);
  }

  public async delete(payment: Payment): Promise<boolean> {
    return true;
  }

  public async exists(
    payment: Payment
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((p) => this.compareMockItems(p, payment));
    return right(found.length !== 0);
  }

  public compareMockItems(a: Payment, b: Payment): boolean {
    return a.id.equals(b.id);
  }
}
