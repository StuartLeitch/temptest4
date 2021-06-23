import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payer } from './../../domain/Payer';

import * as Errors from './getPayerDetailsErrors';

export type GetPayerDetailsResponse = Either<
  Errors.PayerNotFoundError | UnexpectedError,
  Payer
>;
