import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Result';

import * as Errors from './confirmInvoiceErrors';
import { Payer } from '../../../payers/domain/Payer';

export type ConfirmInvoiceResponse = Either<
  | Errors.InvoiceNumberAssignationError
  | Errors.InvoiceAlreadyConfirmedError
  | Errors.ManuscriptNotAcceptedError
  | Errors.TransactionNotFoundError
  | Errors.InvoiceNotFoundError
  | UnexpectedError,
  Payer
>;
