import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { CouponRepoContract } from '../../repos/couponRepo';

import { GenerateCouponCodeResponse } from './generateCouponCodeResponse';

import { CouponCode } from '../../domain/CouponCode';

import {
  AccessControlledUsecase,
  AccessControlContext,
  GenerateCouponCodeAuthenticationContext,
} from './generateCouponCodeAuthenticationContext';

export class GenerateCouponCodeUsecase
  implements
    UseCase<
      {},
      Promise<GenerateCouponCodeResponse>,
      GenerateCouponCodeAuthenticationContext
    >,
    AccessControlledUsecase<
      {},
      GenerateCouponCodeAuthenticationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request?,
    context?: GenerateCouponCodeAuthenticationContext
  ): Promise<GenerateCouponCodeResponse> {
    try {
      const found = false;
      while (!found) {
        const code = CouponCode.generateCouponCode();
        const isCodeDuplicate = await this.couponRepo.isCodeUsed(code);
        if (!isCodeDuplicate) {
          return right(Result.ok(code));
        }
      }
    } catch (err) {
      return left(
        new AppError.UnexpectedError(err, 'Generating coupon code failed.')
      );
    }
  }
}
