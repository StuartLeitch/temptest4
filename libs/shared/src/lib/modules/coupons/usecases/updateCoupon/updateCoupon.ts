// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
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
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { InvoiceItemType } from '../../../invoices/domain/InvoiceItem';

import { UpdateCouponResponse } from './updateCouponResponse';
import { UpdateCouponErrors } from './updateCouponErrors';
import { UpdateCouponDTO } from './updateCouponDTO';

import { CouponCode } from '../../domain/CouponCode';
import { CouponId } from '../../domain/CouponId';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon
} from '../../domain/Coupon';

import { isExpirationDateValid } from '../utils';

export type UpdateCouponContext = AuthorizationContext<Roles>;

export class UpdateCouponUsecase
  implements
    UseCase<
      UpdateCouponDTO,
      Promise<UpdateCouponResponse>,
      UpdateCouponContext
    >,
    AccessControlledUsecase<
      UpdateCouponDTO,
      UpdateCouponContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  // @Authorize('coupon:update')
  public async execute(
    request: UpdateCouponDTO,
    context?: UpdateCouponContext
  ): Promise<UpdateCouponResponse> {
    const maybeValidInput = this.sanityChecksRequestParameters(request);
    const maybeCouponWithInput = await map(
      [this.getCouponWithInput.bind(this)],
      maybeValidInput
    );
    const maybeUpdatedCoupon = maybeCouponWithInput.map(
      this.updateCoupon.bind(this)
    );
    const response = await map(
      [this.saveCoupon.bind(this)],
      maybeUpdatedCoupon
    );
    return (response as unknown) as UpdateCouponResponse;
  }

  private sanityChecksRequestParameters(request: UpdateCouponDTO) {
    const { couponType, status, expirationDate, id } = request;
    if (!id) {
      return left(new UpdateCouponErrors.IdRequired());
    }
    if (!!couponType && !(couponType in CouponType)) {
      return left(new UpdateCouponErrors.InvalidCouponType(couponType));
    }
    if (!!status && !(status in CouponStatus)) {
      return left(new UpdateCouponErrors.InvalidCouponStatus(status));
    }
    if (
      !!couponType &&
      couponType === CouponType.MULTIPLE_USE &&
      !isExpirationDateValid(new Date(expirationDate), CouponType[couponType])
    ) {
      return left(new UpdateCouponErrors.InvalidExpirationDate(expirationDate));
    }
    return right(request);
  }

  private async getCouponWithInput(request: UpdateCouponDTO) {
    const couponId = CouponId.create(new UniqueEntityID(request.id));
    const coupon = await this.couponRepo.getCouponById(couponId.getValue());

    if (!coupon) {
      return left(new UpdateCouponErrors.InvalidId(request.id));
    }

    return right({ coupon, request });
  }

  private updateCoupon({
    coupon,
    request
  }: {
    coupon: Coupon;
    request: UpdateCouponDTO;
  }) {
    const { couponType, expirationDate, status } = request;
    if (!!couponType) {
      coupon.couponType = CouponType[couponType];
      if (couponType === CouponType.SINGLE_USE) {
        coupon.expirationDate = null;
      }
    }
    if (!!expirationDate) {
      coupon.expirationDate = new Date(expirationDate);
    }
    if (!!status) {
      coupon.status = CouponStatus[status];
    }
    return coupon;
  }

  private async saveCoupon(coupon: Coupon) {
    return await this.couponRepo.update(coupon);
  }
}
