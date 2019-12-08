import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GenerateClientTokenErrors } from './generateClientTokenErrors';
import { PaymentClientToken } from './../../../../domain/PaymentClientToken';

export type GenerateClientTokenResponse = Either<
  GenerateClientTokenErrors.ClientTokenNotGenerated | AppError.UnexpectedError,
  Result<PaymentClientToken>
>;
