import {AppError} from '../../../../core/logic/AppError';
import {Either, Result} from '../../../../core/logic/Result';

import {Invoice} from './../../domain/Invoice';
import {CreateInvoiceErrors} from './createInvoiceErrors';

export type CreateInvoiceResponse = Either<
  CreateInvoiceErrors.TransactionNotFoundError | AppError.UnexpectedError,
  Result<Invoice>
>;