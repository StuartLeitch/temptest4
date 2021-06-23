// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';

// * Usecase specific
import { CouponId } from '../../domain/CouponId';
import { Coupon } from '../../domain/Coupon';

import { CouponRepoContract } from '../../repos/couponRepo';

import { UpdateCouponResponse } from './updateCouponResponse';
import { UpdateCouponDTO } from './updateCouponDTO';
import * as Errors from './updateCouponErrors';

import {
  sanityChecksRequestParameters,
  UpdateCouponData,
  updateCoupon,
} from './utils';

export class UpdateCouponUsecase
  implements
    UseCase<
      UpdateCouponDTO,
      Promise<UpdateCouponResponse>,
      UsecaseAuthorizationContext
    > {
  constructor(private couponRepo: CouponRepoContract) {
    this.getCouponWithInput = this.getCouponWithInput.bind(this);
    this.saveCoupon = this.saveCoupon.bind(this);
  }

  public async execute(
    request: UpdateCouponDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<UpdateCouponResponse> {
    const maybeCoupon = await new AsyncEither(request)
      .then(sanityChecksRequestParameters)
      .then(this.getCouponWithInput)
      .map(updateCoupon)
      .then(this.saveCoupon)
      .execute();

    return maybeCoupon;
  }

  private async getCouponWithInput(
    request: UpdateCouponDTO
  ): Promise<
    Either<Errors.CouponNotFoundError | GuardFailure, UpdateCouponData>
  > {
    const couponId = CouponId.create(new UniqueEntityID(request.id));

    const maybeCoupon = await this.couponRepo.getCouponById(couponId);

    if (maybeCoupon.isLeft()) {
      return left(new Errors.CouponNotFoundError(request.id));
    }

    return right({ coupon: maybeCoupon.value, request });
  }

  private async saveCoupon(
    coupon: Coupon
  ): Promise<Either<Errors.CouldNotSaveCouponError, Coupon>> {
    try {
      const savedCoupon = await this.couponRepo.update(coupon);

      if (savedCoupon.isLeft()) {
        return left(
          new Errors.CouldNotSaveCouponError(
            new Error(savedCoupon.value.message)
          )
        );
      }

      return right(savedCoupon.value);
    } catch (e) {
      return left(new Errors.CouldNotSaveCouponError(e));
    }
  }
}
