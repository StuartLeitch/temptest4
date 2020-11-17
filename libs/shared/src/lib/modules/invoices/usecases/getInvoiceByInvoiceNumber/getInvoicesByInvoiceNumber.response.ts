import { Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as Errors from './getInvoicesByInvoiceNumber.errors';
import { Invoice } from '../../domain/Invoice';

export type GetInvoicesByInvoiceNumberResponse = Either<
  Errors.InvoiceNotFoundError | UnexpectedError,
  Invoice[]
>;
