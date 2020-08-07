/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UseCase } from '../../../../core/domain/UseCase';
import { map } from '../../../../core/logic/EitherMap';
import { chain } from '../../../../core/logic/EitherChain';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { UpdateCouponResponse } from './updateCouponResponse';
import { UpdateCouponErrors } from './updateCouponErrors';
import { UpdateCouponDTO } from './updateCouponDTO';

import { CouponId } from '../../domain/CouponId';
import { Coupon } from '../../domain/Coupon';

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
    >,
    AccessControlledUsecase<
      UpdateCouponDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  // @Authorize('coupon:update')
  public async execute(
    request: UpdateCouponDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<UpdateCouponResponse> {
    const maybeValidInput = sanityChecksRequestParameters(request);

    const maybeCouponWithInput = ((await chain(
      [this.getCouponWithInput.bind(this)],
      maybeValidInput
    )) as unknown) as Either<UpdateCouponErrors.InvalidId, UpdateCouponData>;

    const maybeUpdatedCoupon = maybeCouponWithInput.map(updateCoupon);

    const response = await map(
      [this.saveCoupon.bind(this)],
      maybeUpdatedCoupon
    );

    return (response as unknown) as UpdateCouponResponse;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  private async getCouponWithInput(
    request: UpdateCouponDTO
  ): Promise<Either<UpdateCouponErrors.InvalidId, UpdateCouponData>> {
    const couponId = CouponId.create(new UniqueEntityID(request.id));
    const coupon = await this.couponRepo.getCouponById(couponId.getValue());

    if (!coupon) {
      return left(new UpdateCouponErrors.InvalidId(request.id));
    }

    return right({ coupon, request });
  }

  private async saveCoupon(coupon: Coupon): Promise<Result<Coupon>> {
    const savedCoupon = await this.couponRepo.update(coupon);

    return Result.ok(savedCoupon);
  }
}
