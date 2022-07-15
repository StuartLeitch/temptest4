import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';
import * as Errors from './applyWaiversErrors';

export type ApplyWaiversResponse = Either<
  | Errors.InvoiceItemNotFoundError
  | Errors.InvoiceNotFoundError
  | Errors.ManuscriptNotFoundError
  | UnexpectedError,
  void
>;
