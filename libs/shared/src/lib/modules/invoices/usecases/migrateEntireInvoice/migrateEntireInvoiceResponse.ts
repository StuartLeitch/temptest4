import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { AllMigrateEntireInvoiceErrors } from './migrateEntireInvoiceErrors';

export type MigrateEntireInvoiceResponse = Either<
  AllMigrateEntireInvoiceErrors | UnexpectedError,
  void
>;
