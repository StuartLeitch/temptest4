import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Result';

import { ConfirmInvoiceErrors } from './confirmInvoiceErrors';
import { Payer } from '../../../payers/domain/Payer';

export type ConfirmInvoiceResponse = Either<
  | ConfirmInvoiceErrors.InvoiceNumberAssignationError
  | ConfirmInvoiceErrors.InvoiceNotFoundError
  | UnexpectedError,
  Payer
>;
