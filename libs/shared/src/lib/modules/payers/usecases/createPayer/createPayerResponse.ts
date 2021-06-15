import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payer } from '../../domain/Payer';

import * as Errors from './createPayerErrors';

export type CreatePayerResponse = Either<
  | Errors.NotAbleToCreatePayerError
  | Errors.InvoiceNotFoundError
  | Errors.PayerNotFoundError
  | UnexpectedError,
  Payer
>;
