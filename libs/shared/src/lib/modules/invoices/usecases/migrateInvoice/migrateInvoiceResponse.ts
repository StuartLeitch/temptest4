import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { MigrateInvoiceErrors } from './migrateInvoiceErrors';

import { Invoice } from '../../domain/Invoice';

export type MigrateInvoiceResponse = Either<
  MigrateInvoiceErrors.InvoiceNotFound | AppError.UnexpectedError,
  Result<Invoice>
>;
