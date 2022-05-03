import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';
import * as Errors from './catalogBulkUpdateErrors';

export type CatalogBulkUpdateResponse = Either<
  | UnexpectedError
  | Errors.JournalAmountBelowZeroError
  | Errors.JournalAmountFormatError
  | Errors.JournalAmountRequiredError
  | Errors.JournalAmountTooLargeError
  | Errors.JournalIdRequiredError,
  number
>;
