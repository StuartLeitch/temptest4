import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { CouponCode } from '../../domain/CouponCode';

import { CouponRepoContract } from '../../repos/couponRepo';

import { GenerateCouponCodeResponse } from './generateCouponCodeResponse';

export class GenerateCouponCodeUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<GenerateCouponCodeResponse>,
      Context
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  public async execute(
    request?: unknown,
    context?: Context
  ): Promise<GenerateCouponCodeResponse> {
    try {
      const found = false;
      while (!found) {
        const maybeCode = CouponCode.generateCouponCode();
        if (maybeCode.isRight()) {
          const code = maybeCode.value;
          const maybeIsCodeDuplicate = await this.couponRepo.isCodeUsed(code);

          if (maybeIsCodeDuplicate.isLeft()) {
            return left(
              new UnexpectedError(new Error(maybeIsCodeDuplicate.value.message))
            );
          }

          const isCodeDuplicate = maybeIsCodeDuplicate.value;

          if (!isCodeDuplicate) {
            return right(code);
          }
        }
      }
    } catch (err) {
      return left(new UnexpectedError(err, 'Generating coupon code failed.'));
    }
  }
}
