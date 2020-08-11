import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

// import { InvoiceCollection } from '../../domain/Invoice';

export type GetRecentInvoicesResponse = Either<UnexpectedError, Result<any>>;
