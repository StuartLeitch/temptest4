// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { CreateCouponResponse } from './createCouponResponse';
import { CreateCouponErrors } from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

import {
  CouponStatus,
  CouponType,
  Coupon
} from '../../../../domain/reductions/Coupon';

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

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('coupon:create')
  public async execute(
    request: CreateCouponDTO,
    context?: CreateCouponContext
  ): Promise<CreateCouponResponse> {
    const maybeSaneRequest = this.requestSanityChecks(request);
    // TODO: Add check for duplicate coupon codes.

    return null;
  }

  private isCouponCodeValid(code: string): boolean {
    const codeRegex = /^[A-Z0-9]{6, 10}$/;
    if (code && !code.match(codeRegex)) {
      return false;
    } else {
      return true;
    }
  }

  private isExpirationDateValid(
    expirationDate: Date,
    couponType: CouponType
  ): boolean {
    const isExpirationAfterNow = (expiration: Date) => {
      const now = new Date();
      if (expiration.getUTCFullYear() < now.getUTCFullYear()) {
        return false;
      }
      if (expiration.getUTCMonth() < now.getUTCMonth()) {
        return false;
      }
      if (expiration.getUTCDate() < now.getUTCDate()) {
        return false;
      }
      return true;
    };
    if (
      couponType === CouponType.MULTIPLE_USE &&
      !isExpirationAfterNow(expirationDate)
    ) {
      return false;
    } else {
      return true;
    }
  }

  private requestSanityChecks(request: CreateCouponDTO) {
    const { type, status, redeemCount, code, expirationDate } = request;
    if (!(type in CouponType)) {
      return left(new CreateCouponErrors.InvalidCouponType(request.type));
    }
    if (!(status in CouponStatus)) {
      return left(new CreateCouponErrors.InvalidCouponStatus(request.status));
    }
    if (redeemCount <= 0) {
      return left(new CreateCouponErrors.InvalidRedeemCount(redeemCount));
    }
    if (!this.isCouponCodeValid(code)) {
      return left(new CreateCouponErrors.InvalidCouponCode(code));
    }
    if (
      !this.isExpirationDateValid(new Date(expirationDate), CouponType[type])
    ) {
      return left(new CreateCouponErrors.InvalidExpirationDate(expirationDate));
    }

    return right(request);
  }
}
