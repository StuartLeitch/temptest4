// * Core Domain
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { InvoiceItemType } from '../../../invoices/domain/InvoiceItem';

import { CreateCouponResponse } from './createCouponResponse';
import { CouponNotSavedError } from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

import { CouponCode } from '../../domain/CouponCode';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon,
} from '../../domain/Coupon';

import { sanityChecksRequestParameters } from './utils';

export class CreateCouponUsecase
  implements
    UseCase<
      CreateCouponDTO,
      Promise<CreateCouponResponse>,
      UsecaseAuthorizationContext
    > {
  constructor(private couponRepo: CouponRepoContract) {
    this.createCoupon = this.createCoupon.bind(this);
    this.saveCoupon = this.saveCoupon.bind(this);
  }

  public async execute(
    request: CreateCouponDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateCouponResponse> {
    try {
      const finalResult = await new AsyncEither(request)
        .then(sanityChecksRequestParameters(this.couponRepo))
        .then(this.createCoupon)
        .then(this.saveCoupon)
        .execute();

      return finalResult;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async createCoupon(request: CreateCouponDTO) {
    const { code, invoiceItemType, expirationDate, type, status } = request;

    return CouponCode.create(code)
      .map((code) => {
        const now = new Date();
        const props: CouponProps = {
          ...request,
          invoiceItemType: invoiceItemType as InvoiceItemType,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          couponType: CouponType[type],
          status: CouponStatus[status],
          dateCreated: now,
          dateUpdated: now,
          redeemCount: 0,
          code,
        };
        return props;
      })
      .chain((props) => Coupon.create(props));
  }

  private async saveCoupon(
    coupon: Coupon
  ): Promise<Either<CouponNotSavedError, Coupon>> {
    try {
      const result = await this.couponRepo.save(coupon);
      if (result.isLeft()) {
        return left(new CouponNotSavedError(new Error(result.value.message)));
      }
      return right(result.value);
    } catch (err) {
      return left(new CouponNotSavedError(err));
    }
  }
}
