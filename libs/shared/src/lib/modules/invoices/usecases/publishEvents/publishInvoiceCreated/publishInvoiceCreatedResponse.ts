import { Result, Either } from '../../../../../core/logic/Result';
import { AppError } from '../../../../../core/logic/AppError';

import * as PublishInvoiceCreatedErrors from './publishInvoiceCreatedErrors';

export type PublishInvoiceCreatedResponse = Either<
  PublishInvoiceCreatedErrors.InputNotProvidedError | AppError.UnexpectedError,
  Result<void>
>;
