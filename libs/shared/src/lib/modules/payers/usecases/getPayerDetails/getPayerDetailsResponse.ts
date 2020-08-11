import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { GetPayerDetailsErrors } from './getPayerDetailsErrors';
import { Payer } from './../../domain/Payer';

export type GetPayerDetailsResponse = Either<
  GetPayerDetailsErrors.PayerNotFoundError | UnexpectedError,
  Result<Payer>
>;
