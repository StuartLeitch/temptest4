import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GenerateCompensatoryEventsErrors } from './generateCompensatoryEventsErrors';

export type GenerateCompensatoryEventsResponse = Either<
  GenerateCompensatoryEventsErrors.InvoiceIdRequired | AppError.UnexpectedError,
  Result<void>
>;
