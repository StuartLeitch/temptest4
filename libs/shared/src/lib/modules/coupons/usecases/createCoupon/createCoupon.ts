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

import { CouponCode } from '../../../../domain/reductions/CouponCode';
import { CouponId } from '../../../../domain/reductions/CouponId';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon
} from '../../../../domain/reductions/Coupon';

import {
  sanityChecksRequestParameters,
  generateUniqueCouponCode,
  isExpirationDateValid,
  isCouponCodeValid
} from './utils';
import { chain } from 'libs/shared/src/lib/core/logic/EitherChain';

interface CouponAndCodes {
  existingCodes: string[];
  coupon: Coupon;
}

function createCoupon(request: CreateCouponDTO): Coupon {
  const now = new Date();
  const props: CouponProps = {
    ...request,
    code: request.code ? CouponCode.create(request.code).getValue() : null,
    couponType: request.couponType as CouponType,
    dateCreated: now,
    dateUpdated: now
  };

  const coupon = Coupon.create(props);
  return coupon.getValue();
}

function addGeneratedCouponCodeIfNoneProvided({
  coupon,
  existingCodes
}: CouponAndCodes): Either<CreateCouponErrors.NoAvailableCouponCodes, Coupon> {
  if (!coupon.code) {
    return generateUniqueCouponCode(coupon.couponId, existingCodes).map(
      code => {
        coupon.code = code;
        return coupon;
      }
    );
  }

  return right(coupon);
}

function attachExistingCodes(maybeExistingCodes: Either<unknown, string[]>) {
  return (coupon: Coupon) => {
    return maybeExistingCodes.map(existingCodes => ({
      coupon,
      existingCodes
    }));
  };
}

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

  @Authorize('coupon:create')
  public async execute(
    request: CreateCouponDTO,
    context?: CreateCouponContext
  ): Promise<CreateCouponResponse> {
    const maybeExistingCodes = await this.getAllExistingCouponCodes();
    const maybeCoupon = maybeExistingCodes
      .chain(existingCodes =>
        sanityChecksRequestParameters(request, existingCodes)
      )
      .map(createCoupon)
      .chain(attachExistingCodes(maybeExistingCodes))
      .chain(addGeneratedCouponCodeIfNoneProvided);
    const maybeSavedCoupon = await chain([this.saveCoupon], maybeCoupon);

    return maybeSavedCoupon.map(coupon => Result.ok(coupon));
  }

  private async getAccessControlContext(request, context?) {
    return {};
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

  private async saveCoupon(coupon: Coupon) {
    return this.couponRepo.save(coupon);
  }
}
