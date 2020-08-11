import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { GetInvoiceIdByManuscriptCustomIdErrors } from './getInvoiceIdByManuscriptCustomIdErrors';
import { InvoiceId } from './../../domain/InvoiceId';

export type GetInvoiceIdByManuscriptCustomIdResponse = Either<
  | GetInvoiceIdByManuscriptCustomIdErrors.ManuscriptNotFoundError
  | UnexpectedError,
  Result<InvoiceId[]>
>;
