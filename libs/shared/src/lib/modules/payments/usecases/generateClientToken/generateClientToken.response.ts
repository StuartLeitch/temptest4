import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PaymentClientToken } from '../../../../domain/PaymentClientToken';

import * as Errors from './generateClientToken.errors';

export type GenerateClientTokenResponse = Either<
  Errors.ClientTokenNotGenerated | UnexpectedError,
  PaymentClientToken
>;
