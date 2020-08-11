import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { AllMigrateEntireInvoiceErrors } from './migrateEntireInvoiceErrors';

export type MigrateEntireInvoiceResponse = Either<
  AllMigrateEntireInvoiceErrors | UnexpectedError,
  Result<void>
>;
