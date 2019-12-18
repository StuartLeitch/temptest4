import { createHash, randomBytes } from 'crypto';

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right, Either } from '../../../../core/logic/Result';
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

import { CouponId } from '../../../../domain/reductions/CouponId';
import {
  CouponStatus,
  CouponType,
  Coupon
} from '../../../../domain/reductions/Coupon';

const MAX_COUPON_CODE_LENGTH = 10;

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
    const maybeExistingCodes = await this.getAllExistingCouponCodes();
    const maybeSaneRequest = maybeExistingCodes.chain(codes => {
      return this.requestSanityChecks(request, codes);
    });

    return null;
  }

  private async getAllExistingCouponCodes(): Promise<
    Either<AppError.UnexpectedError, string[]>
  > {
    try {
      const codes = await this.couponRepo.getAllUsedCodes();
      return right(codes);
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }

  private generateUniqueCouponCode(
    couponId: CouponId,
    existingCodes: string[]
  ) {
    if (existingCodes.length === 36 * 10) {
      return left(new CreateCouponErrors.NoAvailableCouponCodes());
    }
    while (true) {
      const code = this.generateCouponCode(couponId);
      if (!existingCodes.includes(code)) {
        return right(code);
      }
    }
  }

  private generateCouponCode(couponId: CouponId) {
    const hash = createHash('sha-256');
    const salt = randomBytes(256);
    hash.update(salt);
    hash.update(couponId.id.toString());
    return hash
      .digest('base64')
      .toUpperCase()
      .replace('/', '')
      .replace('+', '')
      .slice(0, MAX_COUPON_CODE_LENGTH);
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

  private requestSanityChecks(
    request: CreateCouponDTO,
    usedCoupons: string[]
  ): SanityCheckResult {
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
    if (usedCoupons.includes(code)) {
      return left(new CreateCouponErrors.DuplicateCouponCode(code));
    }

    return right(request);
  }
}

type SanityCheckResult = Either<
  | CreateCouponErrors.NoAvailableCouponCodes
  | CreateCouponErrors.InvalidExpirationDate
  | CreateCouponErrors.DuplicateCouponCode
  | CreateCouponErrors.InvalidCouponStatus
  | CreateCouponErrors.InvalidRedeemCount
  | CreateCouponErrors.InvalidCouponCode
  | CreateCouponErrors.InvalidCouponType
  | AppError.UnexpectedError,
  CreateCouponDTO
>;
