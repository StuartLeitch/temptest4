import { UnexpectedError } from '../../../.././core/logic/AppError';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './updateInvoiceDetailsErrors';

export type UpdateInvoiceDetailsReponse = Either<
  Errors.InvoiceNotUpdated | UnexpectedError | GuardFailure,
  void
>;
