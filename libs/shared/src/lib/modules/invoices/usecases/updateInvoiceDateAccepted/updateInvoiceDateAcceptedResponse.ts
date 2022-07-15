import { UnexpectedError } from '../../../.././core/logic/AppError';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './updateInvoiceDateAcceptedErrors';

export type UpdateInvoiceDateAcceptedResponse = Either<
  Errors.InvoiceDateAcceptedUpdateError | UnexpectedError | GuardFailure,
  void
>;
