/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';
import { CouponCode } from '../../domain/CouponCode';
import { GenerateCouponCodeResponse } from './generateCouponCodeResponse';

export class GenerateCouponCodeUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<GenerateCouponCodeResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      Record<string, unknown>,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request?,
    context?: UsecaseAuthorizationContext
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
      return left(new UnexpectedError(err, 'Generating coupon code failed.'));
    }
  }
}
