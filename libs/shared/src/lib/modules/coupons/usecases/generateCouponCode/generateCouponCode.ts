import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CouponCode } from '../../domain/CouponCode';

import { CouponRepoContract } from '../../repos/couponRepo';

import { GenerateCouponCodeResponse as Response } from './generateCouponCodeResponse';

export class GenerateCouponCodeUsecase
  extends AccessControlledUsecase<unknown, Context, AccessControlContext>
  implements UseCase<unknown, Promise<Response>, Context> {
  constructor(private couponRepo: CouponRepoContract) {
    super();
  }

  @Authorize('coupon:generateCode')
  public async execute(
    request?: unknown,
    context?: Context
  ): Promise<Response> {
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
