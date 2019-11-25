import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { GetInvoiceIdByManuscriptCustomIdErrors } from './getInvoiceIdByManuscriptCustomIdErrors';
import { InvoiceId } from './../../domain/InvoiceId';

export type GetInvoiceIdByManuscriptCustomIdResponse = Either<
  | GetInvoiceIdByManuscriptCustomIdErrors.ManuscriptNotFoundError
  | AppError.UnexpectedError,
  Result<InvoiceId>
>;
