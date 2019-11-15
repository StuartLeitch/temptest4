import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../.././core/logic/AppError';

import {GetPayerDetailsErrors} from './getPayerDetailsErrors';
import {Payer} from './../../domain/Payer';

export type GetPayerDetailsResponse = Either<
  GetPayerDetailsErrors.PayerNotFoundError | AppError.UnexpectedError,
  Result<Payer>
>;
