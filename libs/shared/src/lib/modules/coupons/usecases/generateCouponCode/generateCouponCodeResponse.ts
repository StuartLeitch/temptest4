import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { CouponCode } from '../../domain/CouponCode';

export type GenerateCouponCodeResponse = Either<UnexpectedError, CouponCode>;
