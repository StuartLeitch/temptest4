import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Coupon } from '../../domain/Coupon';

import * as Errors from './updateCouponErrors';

export type UpdateCouponResponse = Either<
  | Errors.CouldNotSaveCouponError
  | Errors.ExpirationDateRequired
  | Errors.InvalidExpirationDate
  | Errors.CouponNotFoundError
  | Errors.InvalidCouponStatus
  | Errors.InvalidCouponType
  | Errors.IdRequired
  | UnexpectedError
  | GuardFailure,
  Coupon
>;
