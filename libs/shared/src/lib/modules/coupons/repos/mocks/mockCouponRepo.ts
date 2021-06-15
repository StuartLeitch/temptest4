import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { CouponAssignedCollection } from '../../domain/CouponAssignedCollection';
import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';
import { CouponAssigned } from '../../domain/CouponAssigned';
import { CouponCode } from '../../domain/CouponCode';
import { CouponId } from '../../domain/CouponId';
import { Coupon } from '../../domain/Coupon';

import { CouponRepoContract } from '../couponRepo';

import { GetRecentCouponsSuccessResponse } from './../../usecases/getRecentCoupons/getRecentCouponsResponse';

export class MockCouponRepo
  extends BaseMockRepo<Coupon>
  implements CouponRepoContract {
  private invoiceItemToCouponMapper: {
    [key: string]: string[];
  } = {};

  constructor() {
    super();
  }

  async getCouponCollection(): Promise<
    Either<GuardFailure | RepoError, Coupon[]>
  > {
    return right(this._items);
  }

  async getRecentCoupons(): Promise<
    Either<GuardFailure | RepoError, GetRecentCouponsSuccessResponse>
  > {
    return right({
      totalCount: this._items.length,
      coupons: this._items,
    });
  }

  addMockCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): void {
    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToCouponMapper[invoiceIdValue]) {
      this.invoiceItemToCouponMapper[invoiceIdValue] = [];
    }

    this.invoiceItemToCouponMapper[invoiceIdValue].push(coupon.id.toString());
    this._items.push(coupon);
  }

  async getCouponsByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, CouponAssignedCollection>> {
    const couponIds = this.invoiceItemToCouponMapper[
      invoiceItemId.id.toString()
    ];
    if (!couponIds) {
      return right(CouponAssignedCollection.create());
    }
    const coupons = this._items.filter((item) =>
      couponIds.includes(item.id.toString())
    );
    return right(
      CouponAssignedCollection.create(
        coupons.map((coupon) =>
          CouponAssigned.create({
            invoiceItemId,
            coupon,
            dateAssigned: null,
          })
        )
      )
    );
  }

  async getCouponById(
    couponId: CouponId
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const match = this._items.find((item) => item.couponId.equals(couponId));

    if (!match) {
      return left(
        RepoError.createEntityNotFoundError('coupon', couponId.toString())
      );
    }

    return right(match);
  }

  async getCouponByCode(
    code: CouponCode
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const match = this._items.find((item) => item.code.equals(code));
    if (!match) {
      return left(
        RepoError.createEntityNotFoundError('coupon by code', code.toString())
      );
    }
    return right(match);
  }

  async incrementRedeemedCount(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const match = this._items.find((item) => item.id.equals(coupon.id));
    if (!match) {
      return left(
        RepoError.createEntityNotFoundError('coupon', coupon.id.toString())
      );
    }
    Object.defineProperty(match, 'redeemCount', {
      value: match.redeemCount + 1,
      writable: true,
    });

    return right(match);
  }

  async assignCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    return right(coupon);
  }

  async update(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const maybeAlreadyExists = await this.exists(coupon);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, coupon)) {
          return coupon;
        } else {
          return i;
        }
      });
    }

    return right(coupon);
  }

  public async save(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const maybeAlreadyExists = await this.exists(coupon);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      return left(RepoError.fromDBError(new Error('duplicate coupon')));
    }

    this._items.push(coupon);
    return right(coupon);
  }

  async isCodeUsed(
    code: CouponCode | string
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const val = typeof code === 'string' ? code : code.value;
    const found = this._items.filter((item) => item.code.value === val);
    return right(found.length !== 0);
  }

  public async exists(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) => this.compareMockItems(i, coupon));
    return right(found.length !== 0);
  }

  public compareMockItems(a: Coupon, b: Coupon): boolean {
    return a.id.equals(b.id);
  }
}
