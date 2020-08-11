import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { CouponCode } from '../../domain/CouponCode';

export type GenerateCouponCodeResponse = Either<
  UnexpectedError,
  Result<CouponCode>
>;
