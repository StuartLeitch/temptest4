import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Invoice } from '../../domain/Invoice';

export type AddPayerToInvoiceResponse = Either<
  UnexpectedError | Result<any>,
  Result<Invoice>
>;
