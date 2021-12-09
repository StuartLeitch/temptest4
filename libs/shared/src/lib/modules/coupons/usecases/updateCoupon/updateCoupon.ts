// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * Usecase specific
import { CouponId } from '../../domain/CouponId';
import { Coupon } from '../../domain/Coupon';
import { CouponMap } from '../../mappers/CouponMap';

import { CouponRepoContract } from '../../repos/couponRepo';

import { UpdateCouponResponse as Response } from './updateCouponResponse';
import type { UpdateCouponDTO as DTO } from './updateCouponDTO';
import * as Errors from './updateCouponErrors';
import { AuditLoggerServiceContract } from '../../../../infrastructure/audit';

import {
  sanityChecksRequestParameters,
  UpdateCouponData,
  updateCoupon,
} from './utils';

export class UpdateCouponUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
    private couponOldValue;
    private couponCurrentValue;

    constructor(private couponRepo: CouponRepoContract, private auditLoggerService: AuditLoggerServiceContract) {
      super();
      this.getCouponWithInput = this.getCouponWithInput.bind(this);
      this.saveCoupon = this.saveCoupon.bind(this);
    }

    @Authorize('coupon:update')
    public async execute(request: DTO, context?: Context): Promise<Response> {
      const maybeCoupon = await new AsyncEither(request)
        .then(sanityChecksRequestParameters)
        .then(this.getCouponWithInput)
        .map(updateCoupon)
        .then(this.saveCoupon)
        .execute();

      return maybeCoupon;
    }

    private async getCouponWithInput(
      request: DTO
    ): Promise<
      Either<Errors.CouponNotFoundError | GuardFailure, UpdateCouponData>
    > {
      const couponId = CouponId.create(new UniqueEntityID(request.id));

      const maybeCoupon = await this.couponRepo.getCouponById(couponId);

      if (maybeCoupon.isLeft()) {
        return left(new Errors.CouponNotFoundError(request.id));
      }

      // * Save the old value for the audit log
      this.couponOldValue = CouponMap.toPersistence(maybeCoupon.value);

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

        // * Save the audit log
        this.couponCurrentValue = CouponMap.toPersistence(savedCoupon.value);
        this.auditLoggerService.log({
          action: 'edited',
          entity: 'coupon',
          item_reference: savedCoupon.value.couponId.toString(),
          target: `Coupon #${savedCoupon.value.couponId.toString()}`,
          timestamp: new Date(),
        });

        return right(savedCoupon.value);
      } catch (e) {
        return left(new Errors.CouldNotSaveCouponError(e));
      }
    }
}
