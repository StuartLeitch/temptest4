import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './deleteInvoiceErrors';

export type DeleteInvoiceResponse = Either<
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotExistsError
  | UnexpectedError
  | GuardFailure,
  void
>;
