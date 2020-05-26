import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { CouponCode } from '../../domain/CouponCode';

export type GenerateCouponCodeResponse = Either<
  AppError.UnexpectedError,
  Result<CouponCode>
>;
