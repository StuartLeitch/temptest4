import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Coupon } from '../../domain/Coupon';

import { CouponNotFoundError } from './getCouponDetailsByCodeErrors';

export type GetCouponDetailsByCodeResponse = Either<
  CouponNotFoundError | UnexpectedError | GuardFailure,
  Coupon
>;
