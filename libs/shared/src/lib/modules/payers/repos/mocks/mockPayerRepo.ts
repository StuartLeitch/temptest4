import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { PayerId } from '../../domain/PayerId';
import { Payer } from '../../domain/Payer';

import { PayerRepoContract } from '../payerRepo';

export class MockPayerRepo
  extends BaseMockRepo<Payer>
  implements PayerRepoContract {
  constructor() {
    super();
  }

  public async getPayerById(
    payerId: PayerId
  ): Promise<Either<GuardFailure | RepoError, Payer>> {
    const matches = this._items.filter((p) => p.payerId.equals(payerId));
    if (matches.length !== 0) {
      return right(matches[0]);
    } else {
      return right(null);
    }
  }

  public async getPayerByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Payer>> {
    const matches = this._items.filter((p) => p.invoiceId.equals(invoiceId));
    if (matches.length !== 0) {
      return right(matches[0]);
    } else {
      return right(null);
    }
  }

  public async update(
    payer: Payer
  ): Promise<Either<GuardFailure | RepoError, Payer>> {
    const maybeAlreadyExists = await this.exists(payer);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((p) => {
        if (this.compareMockItems(p, payer)) {
          return payer;
        } else {
          return p;
        }
      });
    }

    return right(payer);
  }

  public async save(
    payer: Payer
  ): Promise<Either<GuardFailure | RepoError, Payer>> {
    const maybeAlreadyExists = await this.exists(payer);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((p) => {
        if (this.compareMockItems(p, payer)) {
          return payer;
        } else {
          return p;
        }
      });
    } else {
      this._items.push(payer);
    }

    return right(payer);
  }

  public async exists(
    payer: Payer
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((p) => this.compareMockItems(p, payer));
    return right(found.length !== 0);
  }

  public compareMockItems(a: Payer, b: Payer): boolean {
    return a.id.equals(b.id);
  }
}
