import { AppError } from '../../../../core/logic/AppError';
import { Result, Either } from '../../../../core/logic/Result';

import { PublishInvoiceCreatedErrors } from './publishInvoiceCreatedErrors';

export type PublishInvoiceCreatedResponse = Either<
  PublishInvoiceCreatedErrors.InputNotProvided | AppError.UnexpectedError,
  Result<void>
>;
