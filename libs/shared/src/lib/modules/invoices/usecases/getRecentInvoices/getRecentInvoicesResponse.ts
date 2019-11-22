import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

// import { InvoiceCollection } from '../../domain/Invoice';

export type GetRecentInvoicesResponse = Either<
  AppError.UnexpectedError,
  Result<any[]>
>;
