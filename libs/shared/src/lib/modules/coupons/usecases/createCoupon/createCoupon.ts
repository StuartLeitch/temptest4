import { CouponMap } from './../../mappers/CouponMap';
// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { InvoiceItemType } from '../../../invoices/domain/InvoiceItem';

import { CreateCouponResponse } from './createCouponResponse';
import { CreateCouponDTO } from './createCouponDTO';

import { CouponCode } from '../../domain/CouponCode';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon,
} from '../../domain/Coupon';

import { sanityChecksRequestParameters } from './utils';

export type CreateCouponContext = AuthorizationContext<Roles>;

export class CreateCouponUsecase
  implements
    UseCase<
      CreateCouponDTO,
      Promise<CreateCouponResponse>,
      CreateCouponContext
    >,
    AccessControlledUsecase<
      CreateCouponDTO,
      CreateCouponContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  // @Authorize('coupon:create')
  public async execute(
    request: CreateCouponDTO,
    context?: CreateCouponContext
  ): Promise<CreateCouponResponse> {
    try {
      const maybeSaneRequest = await sanityChecksRequestParameters(
        request,
        this.couponRepo
      );

      const maybeSavedCoupon = await map(
        [this.createCoupon.bind(this), this.saveCoupon.bind(this)],
        maybeSaneRequest
      );

      const finalResult = maybeSavedCoupon.map((coupon) => Result.ok(coupon));

      return (finalResult as unknown) as CreateCouponResponse;
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  private async createCoupon(request: CreateCouponDTO): Promise<Coupon> {
    const { code, invoiceItemType, expirationDate, type, status } = request;

    const couponCode = CouponCode.create(code).getValue();
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
      code: couponCode,
    };

    const coupon = Coupon.create(props);
    return coupon.getValue();
  }

  private async saveCoupon(coupon: Coupon): Promise<Coupon> {
    return this.couponRepo.save(coupon);
  }
}
