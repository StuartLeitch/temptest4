import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { AllMigrateEntireInvoiceErrors } from './migrateEntireInvoiceErrors';

export type MigrateEntireInvoiceResponse = Either<
  AllMigrateEntireInvoiceErrors | AppError.UnexpectedError,
  Result<void>
>;
