import { AppError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

import { ConfirmInvoiceErrors } from './confirmInvoiceErrors';
import { Invoice } from '../../domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';

export type ConfirmInvoiceResponse = Either<
  ConfirmInvoiceErrors.InvoiceNotFoundError | AppError.UnexpectedError,
  Result<Payer>
>;
